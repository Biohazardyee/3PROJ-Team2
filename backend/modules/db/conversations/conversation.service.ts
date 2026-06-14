import {PrismaDb} from "../../../config/database.js";
import {NotFound, BadRequest} from "../../../utils/errors.js";
import {isEmptyString} from "../../../utils/helpers.js";
import {
    ConversationAddDto,
    ConversationAddResponseDto,
    ConversationResponseDeleteDto,
    ConversationResponseDto,
    UserConversationResponseDto,
} from "../../../types/conversations/conversations.dto.js";
import {
    Users,
    Conversations,
    Prisma,
} from "../../../generated/prisma/browser.js";
import {conversationMapper} from "../../../mappers/conversations/conversations.mapper.js";

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

        const conversation = await PrismaDb.conversations.findFirst({
            where: {
                OR: [
                    {user1_id: data.user1_id, user2_id: data.user2_id},
                    {user1_id: data.user2_id, user2_id: data.user1_id},
                ],
            },
        });

        if (conversation) {
            return conversationMapper.toAddDto(conversation);
        }

        const [sortedUser1, sortedUser2] = [data.user1_id, data.user2_id].sort();

        const createData: Prisma.ConversationsUncheckedCreateInput = {
            user1_id: sortedUser1,
            user2_id: sortedUser2,
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

    async getUserConversations(
        userId: string,
    ): Promise<UserConversationResponseDto[]> {
        const conversations = await PrismaDb.conversations.findMany({
            where: {
                OR: [{user1_id: userId}, {user2_id: userId}],
            },
            orderBy: {
                created_at: "desc",
            },
            take: 20,
            select: {
                id: true,
                user1: {
                    select: {
                        id: true,
                        username: true,
                        profile_picture: true,
                        role: true,
                    },
                },
                user2: {
                    select: {
                        id: true,
                        username: true,
                        profile_picture: true,
                        role: true,
                    },
                },
                messages: {
                    orderBy: {created_at: "desc"},
                    take: 1,
                    select: {content: true, created_at: true},
                },
                _count: {
                    select: {
                        messages: {where: {is_read: false, sender_id: {not: userId}}},
                    },
                },
            },
        });

        return conversations.map((conv) => ({
            id: conv.id,
            messages: conv.messages,
            _count: conv._count,
            user1: {
                id: conv.user1.id,
                username: conv.user1.username,
                role: conv.user1.role,
                profile_picture: conv.user1.profile_picture
                    ? `data:image/png;base64,${Buffer.from(conv.user1.profile_picture).toString("base64")}`
                    : null,
            },
            user2: {
                id: conv.user2.id,
                username: conv.user2.username,
                role: conv.user2.role,
                profile_picture: conv.user2.profile_picture
                    ? `data:image/png;base64,${Buffer.from(conv.user2.profile_picture).toString("base64")}`
                    : null,
            },
        }));
    }

    async update(): Promise<null> {
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
