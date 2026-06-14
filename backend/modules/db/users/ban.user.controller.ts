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
                user_id: req.body.user_id,
                content: req.body.content,
            };

            if (!banningData.user_id || !banningData.content) {
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
            if (!req.params.user_id) {
                throw new BadRequest('Id is required');
            }
            const bannedUser: BannedUserResponseDto = await this.service.getById(req.params.user_id);
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

            const allowedFields: (keyof BannedUserUpdateDto)[] = ['content'];

            const bodyKeys: string[] = Object.keys(req.body);

            const invalidKeys: string[] = bodyKeys.filter((key: string): boolean => !allowedFields.includes(key as keyof BannedUserUpdateDto));

            if (invalidKeys.length > 0) {
                throw new BadRequest('Only content can be updated');
            }

            const updateData: BannedUserUpdateDto = {};

            if (req.body.content !== undefined) {
                updateData.content = req.body.content;
            }

            if (Object.keys(updateData).length === 0) {
                throw new BadRequest('No fields provided');
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
                message: 'Ban deleted successfully',
                bannedUser,
            });
        } catch (err) {
            next(err);
        }
    }
}

export default new UserBanController();
