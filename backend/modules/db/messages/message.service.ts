import {prisma} from '../../../config/database.js';
import {BadRequest, NotFound} from '../../../utils/errors.js';
import {isEmptyString, isValidBoolean, isValidStringLength} from '../../../utils/helpers.js';

export class MessageService {

    async create(data: {
        conversation_id: string,
        sender_id: string,
        content: string,
        is_read: boolean,
        created_at: Date,
    }) {
        const {
            conversation_id,
            sender_id,
            content,
            is_read,
        } = data;


        if (isEmptyString(conversation_id)) {
            throw new BadRequest('ConversationID cannot be empty');
        }

        if (isEmptyString(sender_id)) {
            throw new BadRequest('SenderID cannot be empty');
        }

        if (isEmptyString(content)) {
            throw new BadRequest('Conversation content cannot be empty');
        }

        if (!isValidBoolean(is_read)) {
            throw new BadRequest('is_read must be a boolean');
        }

        const conversation = await prisma.conversation.findUnique({
            where: {
                id: conversation_id
            }
        });

        if (!conversation) {
            throw new BadRequest('Conversation not found');
        }

        const sender = await prisma.user.findUnique({
            where: {
                id: sender_id
            }
        });

        if (!sender) {
            throw new BadRequest('Sender not found');
        }

        if (isEmptyString(content)) {
            throw new BadRequest('Content cannot be empty');
        }

        return prisma.message.create({
            data,
            select: {
                id: true,
                conversation_id: true,
                sender_id: true,
                content: true,
                is_read: true,
                created_at: true,
            },
        });
    }

    async getAll() {
        return prisma.message.findMany({
            select: {
                id: true,
                conversation_id: true,
                sender_id: true,
                content: true,
                is_read: true,
                created_at: true,
            },
            orderBy: {
                created_at: 'desc'
            },
        });
    }

    async getById(id: string) {

        if (isEmptyString(id)) {
            throw new BadRequest('Message id is required');
        }

        const message = await prisma.message.findUnique({
            where: {
                id
            },
            select: {
                id: true,
                conversation_id: true,
                sender_id: true,
                content: true,
                is_read: true,
                created_at: true,
            },
        });

        if (!message) throw new NotFound('Report not found');

        return message;
    }

    async update(id: string, data: {
        content?: string,
        is_read?: boolean,
    }) {

        if (isEmptyString(id)) {
            throw new BadRequest('Message id cannot be empty');
        }

        const message = await prisma.message.findUnique({
            where: {
                id
            }
        });

        if (!message) {
            throw new NotFound('Message not found');
        }

        const allowedFields = [
            'content',
            'is_read'
        ];

        for (const key of Object.keys(data)) {
            if (!allowedFields.includes(key)) {
                throw new BadRequest(`Field "${key}" cannot be updated`);
            }
        }

        if (data.content) {
            if (isEmptyString(data.content)) {
                throw new BadRequest('Content cannot be empty');
            }
            if (!isValidStringLength(data.content, 1000)) {
                throw new BadRequest('Content cannot be much than 1000 characters');
            }
        }

        if (data.is_read) {
            if (!isValidBoolean(data.is_read)) {
                throw new BadRequest('is_read must be a boolean');
            }
        }

        return prisma.message.update({
            where: {
                id
            },
            data,
            select: {
                id: true,
                conversation_id: true,
                sender_id: true,
                content: true,
                is_read: true,
                created_at: true,
            }
        });
    }


    async delete(id: string) {

        if (isEmptyString(id)) {
            throw new BadRequest('Message id cannot be empty');
        }

        const message = await prisma.message.findUnique({where: {id}});
        if (!message) {
            throw new NotFound('Message not found');
        }

        return prisma.message.delete({
            where: {
                id
            },
            select: {
                id: true,
                conversation_id: true,
                sender_id: true,
                content: true,
                is_read: true,
                created_at: true,
            }
        });
    }
}

export const messageService = new MessageService();
