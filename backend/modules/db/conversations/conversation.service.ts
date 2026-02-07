import { PrismaDb } from '../../../config/database.js';
import { NotFound, BadRequest } from '../../../utils/errors.js';
import { isValidStringLength, isEmptyString } from "../../../utils/helpers.js";

export class ConversationService {

    async create(data: {
        user1_id: string,
        user2_id: string,
        created_at: Date,
    }) {

        if (isEmptyString(data.user1_id)) {
            throw new BadRequest("User1_id cannot be empty");
        }

        if (isEmptyString(data.user2_id)) {
            throw new BadRequest("User2_id cannot be empty");
        }

        const user1 = await PrismaDb.user.findUnique({
            where: {
                id: data.user1_id,
            }
        })

        if (!user1) {
            throw new BadRequest("The user doesn't exist");
        }

        const user2 = await PrismaDb.user.findUnique({
            where: {
                id: data.user2_id,
            }
        })

        if (!user2) {
            throw new BadRequest("The user doesn't exist");
        }

        const conversation = await PrismaDb.conversation.findUnique({
            where: {
                user1_id_user2_id: {
                    user1_id: data.user1_id,
                    user2_id: data.user2_id,
                }
            }
        })

        if (conversation) {
            throw new BadRequest('The conversation already exists between these two users');
        }

        return PrismaDb.conversation.create({
            data,
            select: {
                user1_id: true,
                user2_id: true,
                created_at: true,
            },
        });
    }

    async getAll() {
        return PrismaDb.conversation.findMany({
            select: {
                user1_id: true,
                user2_id: true,
                created_at: true,
            }
        });
    }

    async getById(id: string) {

        if (isEmptyString(id)) {
            throw new BadRequest("ID cannot be empty");
        }

        const conversation = await PrismaDb.conversation.findUnique({
            where: {
                id: id,
            },
            select: {
                user1_id: true,
                user2_id: true,
                created_at: true
            }
        });

        if (!conversation) {
            throw new NotFound('Conversation not found');
        }

        return conversation;
    }

    async update(): Promise<null> {
        // Conversations are not updatable
        return null
    }

    async delete(id: string) {

        if (isEmptyString(id)) {
            throw new BadRequest("ID cannot be empty");
        }

        return PrismaDb.conversation.delete({
            where: {
                id: id,
            },
            select: {
                user1_id: true,
                user2_id: true,
                created_at: true
            },
        });
    }
}

export const conversationService = new ConversationService();