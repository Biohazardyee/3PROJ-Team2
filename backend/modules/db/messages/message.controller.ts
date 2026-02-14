import type {Request, Response, NextFunction} from 'express';

import {Controller} from '../../controller.js';
import {BadRequest} from '../../../utils/errors.js';
import {MessageService, messageService} from './message.service.js';
import {
    MessageAddDto,
    MessageAddResponseDto, MessageDeleteResponseDto,
    MessageResponseDto,
    MessageUpdateDto
} from "../../../types/messages/messages.dto";

class MessageController extends Controller {

    constructor(private readonly service: MessageService = messageService) {
        super();
    }

    async add(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {

            const creationData: MessageAddDto = {
                conversation_id: req.body.conversation_id,
                sender_id: req.body.sender_id,
                content: req.body.content,
            }

            if (!creationData.conversation_id || !req.body.sender_id || !req.body.content) {
                throw new BadRequest('conversation_id, sender_id and content are required');
            }

            const message: MessageAddResponseDto = await this.service.create(creationData)

            res.status(201).json({
                message_text: 'Message created successfully',
                message,
            });

        } catch (err) {
            next(err);
        }
    }

    async getAll(_: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const messages: MessageResponseDto[] = await this.service.getAll();
            res.status(201).json({
                message: 'All messages retrieved successfully',
                messages,
            });
        } catch (err) {
            next(err);
        }
    }

    async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {

            if (!req.params.id) {
                throw new BadRequest('ID is required');
            }

            const message: MessageResponseDto = await this.service.getById(req.params.id);

            res.status(201).json({
                message_text: `Message retrieved successfully`,
                message,
            });

        } catch (err) {
            next(err);
        }
    }

    async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id: string = req.params.id;

            if (!id) {
                throw new BadRequest('ID is required');
            }

            const updateData: MessageUpdateDto = {}

            if (req.body.content) {
                updateData.content = req.body.content;
            }

            if (req.body.is_read !== undefined) {
                updateData.is_read = req.body.is_read;
            }

            if (Object.keys(updateData).length === 0) {
                throw new BadRequest("No fields provided")
            }

            const message: MessageResponseDto = await this.service.update(id, updateData)

            res.status(200).json({
                message_text: `Message updated successfully`,
                message,
            });

        } catch (err) {
            next(err);
        }
    }

    async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {

            if (!req.params.id) {
                throw new BadRequest('ID is required');
            }

            const message: MessageDeleteResponseDto = await this.service.delete(req.params.id);
            res.status(200).json({
                message_text: 'Comment deleted successfully',
                message,
            });
        } catch (err) {
            next(err);
        }
    }
}

export default new MessageController();