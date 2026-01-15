import type { Request, Response, NextFunction } from 'express';

import { Controller } from '../controller.js';
import { BadRequest } from '../../utils/errors.js';
import { followService } from './follow.service.js';

class FollowController  {

    constructor(private readonly service = followService) {
      
    }

    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const { user_id, follow_user_id } = req.body;

            if (!user_id || !follow_user_id) {
                throw new BadRequest('user_id and follow_user_id are required');
            }

            const follow = await this.service.create({ user_id, follow_user_id });

            res.status(201).json({
                message: 'User followed successfully',
                follow,
            });
        } catch (error) {
            next(error);
        }
    }

    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const { user_id, follow_user_id } = req.body;

            const unfollow = await this.service.delete(user_id, follow_user_id);
            res.status(200).json({
                message: 'User unfollowed successfully',
                unfollow,
            });
        } catch (error) {
            next(error);
        }
    }

    async getFollowers(req: Request, res: Response, next: NextFunction) {
        try {
            const { user_id } = req.params;

            const followers = await this.service.getFollowers(user_id);

            res.status(200).json({
                message: 'Followers retrieved successfully',
                followers,
            });
        } catch (error) {
            next(error);
        }
    }

    async getFollowing(req: Request, res: Response, next: NextFunction) {
        try {
            const { user_id } = req.params;

            const following = await this.service.getFollowing(user_id);

            res.status(200).json({
                message: 'Following retrieved successfully',
                following,
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new FollowController();
