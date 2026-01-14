import type { Request, Response, NextFunction } from 'express';

import { BadRequest, NotFound } from '../../utils/errors.js';
import { Controller } from '../controller.js';
import { banUserService } from './ban.user.service.js';


class UserBanController extends Controller {

    constructor(private readonly service = banUserService) {
        super();
    }

    async add(req: Request, res: Response, next: NextFunction) {
        try {
            const { id, content } = req.body;

            if (!id || !content) {
                throw new BadRequest('User id and ban reason are required');
            }

            const bannedUser = await this.service.create({ id, content });

            res.status(201).json({
                message: 'User banned successfully',
                bannedUser
            });

        } catch (error) {
            next(error);
        }
    }

    async getAll(req: Request, res: Response, next: NextFunction) {
    try {
        const bannedUsers = await this.service.getAll();
        res.status(200).json(bannedUsers);
    } catch (error) {
        next(error);
    }
}

    async getById(req: Request, res: Response, next: NextFunction) {
    try {
        const { user_id } = req.params;
        const bannedUser = await this.service.getById(user_id);
        if (!bannedUser) {
            throw new NotFound('Banned user not found');
        }
        res.status(200).json(bannedUser);
    } catch (error) {
        next(error);
    }
}

    async update(req: Request, res: Response, next: NextFunction) {
    try {
        const { id } = req.params;
        const { content } = req.body;

        const updatedBannedUser = await this.service.update(id, { content });

        res.status(200).json({
            message: 'Banned user updated successfully',
            bannedUser: updatedBannedUser
        });
    }
    catch (error) {
        next(error);
    }
}


    async delete (req: Request, res: Response, next: NextFunction) {
    try {
        const { id } = req.params;
        const deletedBannedUser = await this.service.delete(id);
        res.status(200).json({
            message: 'Banned user deleted successfully',
            bannedUser: deletedBannedUser
        });
    } catch (error) {
        next(error);
    }
}
}

export default new UserBanController();
