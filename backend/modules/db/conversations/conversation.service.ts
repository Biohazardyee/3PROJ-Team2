import {PrismaDb} from "../../../config/database.js";
import {NotFound, BadRequest} from "../../../utils/errors.js";
import {isEmptyString} from "../../../utils/helpers.js";
import {bufferToImageDataUri} from "../../../utils/imageDataUri.js";
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

        // Une conversation ne peut être créée qu'entre deux personnes qui se suivent mutuellement
        const [aFollowsB, bFollowsA] = await Promise.all([
            PrismaDb.follows.findUnique({
                where: {
                    user_id_follow_user_id: {
                        user_id: data.user1_id,
                        follow_user_id: data.user2_id,
                    },
                },
            }),
            PrismaDb.follows.findUnique({
                where: {
                    user_id_follow_user_id: {
                        user_id: data.user2_id,
                        follow_user_id: data.user1_id,
                    },
                },
            }),
        ]);

        if (!aFollowsB || !bFollowsA) {
            throw new BadRequest(
                "Une conversation nécessite un abonnement mutuel entre les deux utilisateurs",
            );
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
                        pseudo: true,
                        profile_picture: true,
                        role: true,
                        equipped_avatar_border: true,
                        equipped_font: true,
                        equipped_text_effect: true,
                    },
                },
                user2: {
                    select: {
                        id: true,
                        username: true,
                        pseudo: true,
                        profile_picture: true,
                        role: true,
                        equipped_avatar_border: true,
                        equipped_font: true,
                        equipped_text_effect: true,
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
                pseudo: conv.user1.pseudo,
                role: conv.user1.role,
                profile_picture: bufferToImageDataUri(conv.user1.profile_picture),
                equipped_avatar_border: conv.user1.equipped_avatar_border,
                equipped_font: conv.user1.equipped_font,
                equipped_text_effect: conv.user1.equipped_text_effect,
            },
            user2: {
                id: conv.user2.id,
                username: conv.user2.username,
                pseudo: conv.user2.pseudo,
                role: conv.user2.role,
                profile_picture: bufferToImageDataUri(conv.user2.profile_picture),
                equipped_avatar_border: conv.user2.equipped_avatar_border,
                equipped_font: conv.user2.equipped_font,
                equipped_text_effect: conv.user2.equipped_text_effect,
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
