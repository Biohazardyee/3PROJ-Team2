import { Server } from "socket.io";
import http from "http";
import { PrismaDb } from "../../config/database.js";
import { messageService } from "../db/messages/message.service.js";
import { Conversations, Users } from "../../generated/prisma/client.js";
import { MessageAddResponseDto } from "../../types/messages/messages.dto";
import jwt from "jsonwebtoken";
import { SocketUser } from "../../types/users/user.dto.js";
import {
  canSendNotification,
  truncateContent,
} from "../db/notifications/notification.helper.js";
import { sendPushNotification } from "../db/notifications/notification.push.js";

export const initSocket = (server: http.Server) => {
  const io = new Server(server, {
    cors: { origin: "*" },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.use(async (socket, next): Promise<void> => {
    try {
      const rawToken = socket.handshake.auth.token;
      const token = rawToken?.replace(/#$/, "");

      if (!token) {
        return next(new Error("Token missing"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as SocketUser;

      const userExists: Users | null = await PrismaDb.users.findUnique({
        where: { id: decoded.id },
      });

      if (!userExists) {
        console.error(
          `[Socket Auth] Rejected: User ${decoded.id} not found in DB`,
        );
        return next(new Error("User not found"));
      }

      socket.data.user = decoded;

      next();
    } catch (err) {
      console.error("[Socket Auth] Error:", err);
      return next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket): void => {
    const user = socket.data.user as SocketUser;

    socket.join(`user_${user.id}`);

    socket.on("error", (err) => {
      console.error(`[Socket Internal Error] User ${user.id}:`, err);
    });

    socket.on(
      "join_conversation",
      async ({ conversationId }: { conversationId: string }): Promise<void> => {
        try {
          const conversation: Conversations | null =
            await PrismaDb.conversations.findUnique({
              where: { id: conversationId },
            });

          if (
            !conversation ||
            (conversation.user1_id !== user.id &&
              conversation.user2_id !== user.id)
          ) {
            console.warn(
              `[Join Denied] User ${user.id} unauthorized for conv: ${conversationId}`,
            );
            return;
          }

          socket.join(conversationId);

          const updatedMessages = await PrismaDb.messages.updateMany({
            where: {
              conversation_id: conversationId,
              sender_id: { not: user.id },
              is_read: false,
            },
            data: { is_read: true },
          });

          if (updatedMessages.count > 0) {
            io.to(`user_${conversation.user1_id}`).emit(
              "conversation_marked_read",
              { conversationId },
            );
            io.to(`user_${conversation.user2_id}`).emit(
              "conversation_marked_read",
              { conversationId },
            );
          }
        } catch (err) {
          console.error(`[Join Error] for user ${user.id}:`, err);
        }
      },
    );

    socket.on(
      "send_message",
      async (data: {
        conversation_id: string;
        content: string;
      }): Promise<void> => {
        try {
          if (!data.conversation_id || !data.content) return;

          const conversation: Conversations | null =
            await PrismaDb.conversations.findUnique({
              where: { id: data.conversation_id },
            });

          if (
            !conversation ||
            (conversation.user1_id !== user.id &&
              conversation.user2_id !== user.id)
          ) {
            console.error(
              `[Message Rejected] Unauthorized or invalid conversation: ${data.conversation_id}`,
            );
            return;
          }

          const message: MessageAddResponseDto = await messageService.create({
            conversation_id: data.conversation_id,
            sender_id: user.id,
            content: data.content,
          });

          const messageToEmit = {
            ...message,
            created_at: message.created_at || new Date().toISOString(),
          };

          io.to(`user_${conversation.user1_id}`).emit(
            "update_conversation_list",
            messageToEmit,
          );
          io.to(`user_${conversation.user2_id}`).emit(
            "update_conversation_list",
            messageToEmit,
          );
          io.to(`user_${conversation.user1_id}`).emit(
            "receive_message",
            messageToEmit,
          );
          io.to(`user_${conversation.user2_id}`).emit(
            "receive_message",
            messageToEmit,
          );

          // Notification Push
          const recipientId =
            conversation.user1_id === user.id
              ? conversation.user2_id
              : conversation.user1_id;
          const recipient = await PrismaDb.users.findUnique({
            where: { id: recipientId },
            select: { expo_push_token: true },
          });

          if (recipient?.expo_push_token) {
            const isAllowed = await canSendNotification(
              recipientId,
              user.id,
              "new_message",
              0.5,
            );
            if (isAllowed) {
              await sendPushNotification(
                recipient.expo_push_token,
                "Nouveau message",
                `${user.username || "Quelqu'un"} : ${truncateContent(data.content, 50)}`,
                {
                  action: "new_message",
                  conversation_id: data.conversation_id,
                },
              );
            }
          }
        } catch (err) {
          console.error(`[Message Error] User ${user.id}:`, err);
        }
      },
    );

    socket.on("disconnect", (): void => {});
  });

  return io;
};
