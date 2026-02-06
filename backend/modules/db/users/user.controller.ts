import type {Request, Response, NextFunction} from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

import {Controller} from '../../controller.js';
import {Unauthorized, BadRequest} from '../../../utils/errors.js';
import {UserService, userService} from './user.service.js';

import {
    LoginDto,
    UserRegistrationDto,
    UserResponseDto,
    UserResponseLoginDto,
    UserUpdateDto
} from "../../../types/user.dto.js";

import {User} from "../../../generated/prisma/browser.js";
import {UserMapper} from "../../../mappers/user.mapper";

dotenv.config();

class UserController extends Controller {

    constructor(private readonly service: UserService = userService) {
        super();
    }

    async add(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const registrationData: UserRegistrationDto = {
                email: req.body.email,
                username: req.body.username,
                password: req.body.password,
                favorite_band: req.body.favorite_band,
                profile_picture: req.body.profile_picture,
            };

            if (!registrationData.email || !registrationData.username || !registrationData.password) {
                throw new BadRequest('Email, username and password are required');
            }

            const user: UserResponseDto = await this.service.add(registrationData);

            res.status(201).json({
                message: 'User created successfully',
                user,
            });
        } catch (err) {
            next(err);
        }
    }

    async login(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const loginData: LoginDto = {
                email: req.body.email,
                password: req.body.password,
            };

            if (!loginData.email || !loginData.password) {
                throw new BadRequest('Email and password required');
            }

            const user: User | null = await this.service.getByEmail(loginData.email);

            if (!user) {
                throw new Unauthorized('Invalid email or password');
            }

            const isValid: boolean = await bcrypt.compare(loginData.password, user.password);

            if (!isValid) {
                throw new Unauthorized('Invalid email or password');
            }

            const token: string = jwt.sign(
                {
                    id: user.id,
                    email: user.email,
                    username: user.username,
                    role: user.role,
                },
                process.env.JWT_SECRET!,
                {
                    expiresIn: '1h'
                }
            );

            const userResponse: UserResponseLoginDto  = UserMapper.toLoginDto(user);

            res.json({
                message: 'Login successful',
                token,
                userResponse,
            });
        } catch (err) {
            next(err);
        }
    }

    async getAll(_: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const users: UserResponseDto[] = await this.service.getAll();
            res.json(users);
        } catch (err) {
            next(err);
        }
    }

    async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.params.id) {
                throw new BadRequest('Id is required');
            }
            const user: UserResponseDto = await this.service.getById(req.params.id);
            res.json(user);
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

            const updateData: UserUpdateDto = {
                username: req.body.username,
                password: req.body.password,
                favorite_band: req.body.favorite_band,
                phone_number: req.body.phone_number,
                biography: req.body.biography,
                has_notifications: req.body.has_notifications,
                profile_picture: req.body.profile_picture,
            }

            let data: UserUpdateDto = {}

            if (updateData.username) {
                data.username = updateData.username;
            }

            if (updateData.password) {
                data.password = await bcrypt.hash(updateData.password, 10);
            }

            if (updateData.phone_number) {
                data.phone_number = updateData.phone_number;
            }

            if (updateData.biography) {
                data.biography = updateData.biography;
            }

            if (updateData.favorite_band) {
                data.favorite_band = updateData.favorite_band;
            }

            if (updateData.has_notifications) {
                data.has_notifications = updateData.has_notifications;
            }

            if (updateData.profile_picture) {
                data.profile_picture = updateData.profile_picture;
            }

            if (Object.keys(data).length === 0) {
                throw new BadRequest("No fields provided")
            }

            const user: UserResponseDto = await this.service.update(id, data);

            res.status(200).json({
                message: 'User updated successfully',
                user,
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
            const user: Partial<User> = await this.service.delete(req.params.id);
            res.json({
                message: 'User deleted successfully',
                user,
            });
        } catch (err) {
            next(err);
        }
    }
}

export default new UserController();