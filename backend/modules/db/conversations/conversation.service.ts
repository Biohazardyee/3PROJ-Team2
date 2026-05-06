import { PrismaDb } from "../../../config/database.js";
import { NotFound, BadRequest } from "../../../utils/errors.js";
import { isEmptyString } from "../../../utils/helpers.js";
import {
  ConversationAddDto,
  ConversationAddResponseDto,
  ConversationResponseDeleteDto,
  ConversationResponseDto,
} from "../../../types/conversations/conversations.dto.js";
import {
  Users,
  Conversations,
  Prisma,
} from "../../../generated/prisma/browser.js";
import { conversationMapper } from "../../../mappers/conversations/conversations.mapper.js";

export class ConversationService {
  async create(data: ConversationAddDto): Promise<ConversationAddResponseDto> {
    if (isEmptyString(data.user1_id)) {
      throw new BadRequest("User1_id cannot be empty");
    }

    if (isEmptyString(data.user2_id)) {
      throw new BadRequest("User2_id cannot be empty");
    }

    const user1: Users | null = await PrismaDb.users.findUnique({
      where: {
        id: data.user1_id,
      },
    });

    if (!user1) {
      throw new BadRequest("The user doesn't exist");
    }

    const user2: Users | null = await PrismaDb.users.findUnique({
      where: {
        id: data.user2_id,
      },
    });

    if (!user2) {
      throw new BadRequest("The user doesn't exist");
    }

    const conversation: Conversations | null =
      await PrismaDb.conversations.findUnique({
        where: {
          user1_id_user2_id: {
            user1_id: data.user1_id,
            user2_id: data.user2_id,
          },
        },
      });

    if (conversation) {
      throw new BadRequest(
        "The conversation already exists between these two users",
      );
    }

    const createData: Prisma.ConversationsUncheckedCreateInput = {
      user1_id: data.user1_id,
      user2_id: data.user2_id,
    };

    const conversationToCreate = await PrismaDb.conversations.create({
      data: createData,
    });

    return conversationMapper.toAddDto(conversationToCreate);
  }

  async getAll(): Promise<ConversationResponseDto[]> {
    const conversations: Conversations[] =
      await PrismaDb.conversations.findMany({
        orderBy: {
          created_at: "desc",
        },
      });
    return conversationMapper.toDtoList(conversations);
  }

  async getById(id: string): Promise<ConversationResponseDto> {
    if (isEmptyString(id)) {
      throw new BadRequest("ID cannot be empty");
    }

    const conversation: Conversations | null =
      await PrismaDb.conversations.findUnique({
        where: {
          id,
        },
      });

    if (!conversation) {
      throw new NotFound("Conversation not found");
    }

    return conversationMapper.toDto(conversation);
  }

  async getUserConversations(userId: string): Promise<any[]> {
    return await PrismaDb.conversations.findMany({
      where: {
        OR: [{ user1_id: userId }, { user2_id: userId }],
      },
      take: 20, // AJOUTEZ CECI IMMÉDIATEMENT (Pagination)
      select: {
        id: true,
        user1: {
          select: {
            username: true,
            profile_picture: true, 
            role: true,
          },
        },
        user2: {
          select: {
            username: true,
            profile_picture: true,
            role: true,
          },
        },
        messages: {
          orderBy: { created_at: "desc" },
          take: 1,
          select: { content: true, created_at: true },
        },
        _count: {
          select: {
            messages: { where: { is_read: false, sender_id: { not: userId } } },
          },
        },
      },
    });
  }

  async update(): Promise<null> {
    // Conversations are not updatable
    return null;
  }

  async delete(id: string): Promise<ConversationResponseDeleteDto> {
    if (isEmptyString(id)) {
      throw new BadRequest("ID cannot be empty");
    }

    const conversation: Conversations | null =
      await PrismaDb.conversations.findUnique({
        where: {
          id,
        },
      });

    if (!conversation) {
      throw new NotFound("Conversation not found");
    }

    const conversationToDelete: Conversations =
      await PrismaDb.conversations.delete({
        where: {
          id,
        },
      });

    return conversationMapper.toDeleteDto(conversationToDelete);
  }
}

export const conversationService = new ConversationService();
