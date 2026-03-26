import {Server} from "socket.io";
import http from "http";
import {PrismaDb} from "../../config/database.js";
import {messageService} from "../db/messages/message.service.js";
import {Conversations, Users} from "../../generated/prisma/client.js";
import {MessageAddResponseDto} from "../../types/messages/messages.dto";
import jwt from "jsonwebtoken";
import {Unauthorized} from "../../utils/errors.js";
import {SocketUser} from "../../types/users/user.dto.js";

export const initSocket = (server: http.Server) => {
    const io = new Server(server, {
        cors: {origin: "*"},
    });


    io.use(async (socket, next): Promise<void> => {
        try {
            const token: any = socket.handshake.auth.token;
            if (!token) return next(new Unauthorized("Token missing"));

            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as SocketUser;

            const userExists: Users | null = await PrismaDb.users.findUnique({
                where: {id: decoded.id},
            });
            if (!userExists) return next(new Unauthorized("User not found"));

            socket.data.user = decoded;
            next();
        } catch (err) {
            return next(new Unauthorized("Invalid token"));
        }
    });

    io.on("connection", (socket):void => {
        const user = socket.data.user as SocketUser;

        // Rejoindre une conversation
        socket.on("join_conversation", async ({conversationId}: { conversationId: string }): Promise<void> => {
            try {
                const conversation: Conversations | null = await PrismaDb.conversations.findUnique({
                    where: {id: conversationId},
                });
                if (!conversation) {
                    return;
                }

                if (conversation.user1_id !== user.id && conversation.user2_id !== user.id) {
                    console.log(`❌ User ${user.id} tried to join conversation ${conversationId} without permission`);
                    return;
                }

                socket.join(conversationId);
            } catch (err) {
                console.error(err);
            }
        });

        // Envoyer un message
        socket.on("send_message", async (data: { conversation_id: string; content: string }): Promise<void> => {
            try {
                if (!data.conversation_id || !data.content) return;

                const conversation: Conversations | null = await PrismaDb.conversations.findUnique({
                    where: {
                        id: data.conversation_id
                    },
                });

                if (!conversation) return;

                if (conversation.user1_id !== user.id && conversation.user2_id !== user.id) {
                    return;
                }

                const message: MessageAddResponseDto = await messageService.create({
                    conversation_id: data.conversation_id,
                    sender_id: user.id,
                    content: data.content,
                });

                io.to(data.conversation_id).emit("receive_message", message);
            } catch (err) {
                console.error(err);
            }
        });

        socket.on("disconnect", ():void => {
            console.log(`❌ User disconnected: ${user.id} (socket ${socket.id})`);
        });
    });

    return io;
};