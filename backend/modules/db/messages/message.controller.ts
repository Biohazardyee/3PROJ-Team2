import type {Request, Response, NextFunction} from 'express';

import {Controller} from '../../controller.js';
import {BadRequest} from '../../../utils/errors.js';
import {messageService} from './message.service.js';
import {isEmptyString} from "../../../utils/helpers";

class MessageController extends Controller {

    constructor(private readonly service = messageService) {
        super();
    }

    async add(req: Request, res: Response, next: NextFunction) {
        try {
            const {
                conversation_id,
                sender_id,
                content,
                is_read
            } = req.body;

            const message = await this.service.create({
                conversation_id,
                sender_id,
                content,
                is_read,
                created_at: new Date(),
            });

            res.status(201).json({
                message_text: 'Message created successfully',
                message,
            });
        } catch (err) {
            next(err);
        }
    }

    async getAll(_: Request, res: Response, next: NextFunction) {
        try {
            const messages = await this.service.getAll();
            res.status(201).json({
                message: 'All messages retrieved successfully',
                messages,
            });
        } catch (err) {
            next(err);
        }
    }

    async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const {
                id
            } = req.params;

            if (!id) {
                throw new BadRequest('ID is required');
            }

            const message = await this.service.getById(id);

            res.status(201).json({
                message_text: `Message retrieved successfully`,
                message,
            });
        } catch (err) {
            next(err);
        }
    }

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.params.id;

            if (!id) {
                throw new BadRequest('ID is required');
            }

            const {
                content,
                is_read,
            } = req.body;

            let data: any = {}

            if (content) {
                data.content = content;
            }

            if (is_read) {
                data.is_read = is_read;
            }

            if (Object.keys(data).length === 0) {
                throw new BadRequest("No fields provided")
            }

            const message = this.service.update(id, data)

            res.status(201).json({
                message_text: `Message updated successfully`,
                message,
            });

        } catch (err) {
            next(err);
        }
    }

    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const {
                id
            } = req.params;

            if (!id) {
                throw new BadRequest('ID is required');
            }

            const message = await this.service.delete(id);
            res.json({
                message_text: 'Comment deleted successfully',
                message,
            });
        } catch (err) {
            next(err);
        }
    }
}

export default new MessageController();