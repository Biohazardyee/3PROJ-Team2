import type {Request, Response, NextFunction} from 'express';
import {BadRequest} from '../../../utils/errors.js';
import {BanUserService, banUserService} from './ban.user.service.js';
import {Controller} from "../../controller.js";
import {
    BannedUserAddDto,
    BannedUserDeleteDto,
    BannedUserResponseDto,
    BannedUserUpdateDto
} from "../../../types/users/banned.user.dto.js";

class UserBanController extends Controller {

    constructor(private readonly service: BanUserService = banUserService) {
        super();
    }

    async add(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const banningData: BannedUserAddDto = {
                id: req.body.id,
                user_id: req.body.user_id,
                content: req.body.content,
            };

            if (!banningData.id || banningData.content) {
                throw new BadRequest('User ID and Content are needed');
            }

            const bannedUser: BannedUserResponseDto = await this.service.create(banningData);

            res.status(201).json({
                message: 'Banned user created successfully',
                bannedUser,
            });
        } catch (err) {
            next(err);
        }
    }

    async getAll(_: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const bannedUsers: BannedUserResponseDto[] = await this.service.getAll();
            res.status(200).json({
                message: 'Banned users retrieved successfully',
                bannedUsers
            });
        } catch (error) {
            next(error);
        }
    }

    async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.params.id) {
                throw new BadRequest('Id is required');
            }
            const bannedUser: BannedUserResponseDto = await this.service.getById(req.params.id);
            res.json(bannedUser);
        } catch (err) {
            next(err);
        }
    }

    async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id: string = req.params.id;

            if (!id) {
                throw new BadRequest('Id is required');
            }

            const updateData: BannedUserUpdateDto = {};

            if (req.body.content !== undefined) {
                updateData.content = req.body.content;
            }

            const bannedUser: BannedUserResponseDto = await this.service.update(id, updateData);

            res.status(200).json({
                message: 'Banned user updated successfully',
                bannedUser,
            });
        } catch (err) {
            next(err);
        }
    }

    async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.params.id) {
                throw new BadRequest('Id is required');
            }

            const bannedUser: BannedUserDeleteDto = await this.service.delete(req.params.id);

            res.json({
                message: 'User deleted successfully',
                bannedUser,
            });
        } catch (err) {
            next(err);
        }
    }
}

export default new UserBanController();
