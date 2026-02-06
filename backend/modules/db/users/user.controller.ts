import type {Request, Response, NextFunction} from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

import {Controller} from '../../controller.js';
import {Unauthorized, BadRequest} from '../../../utils/errors.js';
import {userService} from './user.service.js';

import {NotFound} from '../../../utils/errors.js';
import {LoginDto, UserRegistrationDto, UserWithoutPassword} from "../../../types/user.dto.js";
import {User} from "../../../generated/prisma/browser.js";
import {UserUpdateInput} from "../../../generated/prisma/models/User.js";

dotenv.config();

class UserController extends Controller {

    constructor(private readonly service = userService) {
        super();
    }

    async add(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const registrationData: UserRegistrationDto = {
                email: req.body.email,
                username: req.body.username,
                password: req.body.password,
                favorite_band: req.body.favorite_band,
            };

            if (!registrationData.email || !registrationData.username || !registrationData.password) {
                throw new BadRequest('Email, username and password are required');
            }

            const user: UserWithoutPassword = await this.service.add(registrationData);

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

            res.json({
                message: 'Login successful',
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    username: user.username,
                    role: user.role,
                },
            });
        } catch (err) {
            next(err);
        }
    }

    async getAll(_: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const users: UserWithoutPassword[] = await this.service.getAll();
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
            const user: UserWithoutPassword = await this.service.getById(req.params.id);
            res.json(user);
        } catch (err) {
            next(err);
        }
    }

    async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {

            const id = req.params.id;

            if (!id) {
                throw new BadRequest('Id is required');
            }

            const {
                username,
                password,
                phone_number,
                biography,
                favorite_band,
                has_notifications,
                profile_picture
            } = req.body;

            let data: UserUpdateInput = {}

            if (username) {
                data.username = username;
            }

            if (password) {
                data.password = password;
            }

            if (phone_number) {
                data.phone_number = phone_number;
            }

            if (biography) {
                data.biography = biography;
            }

            if (favorite_band) {
                data.favorite_band = favorite_band;
            }

            if (has_notifications) {
                data.has_notifications = has_notifications;
            }

            if (profile_picture) {
                data.profile_picture = profile_picture;
            }

            if (password) {
                data.password = await bcrypt.hash(password, 10);
            }

            if (Object.keys(data).length === 0) {
                throw new BadRequest("No fields provided")
            }

            const user: UserWithoutPassword = await this.service.update(id, data);

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

    async getByEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const email = req.body.email;

            if (!email) {
                throw new BadRequest('Email is required');
            }

            // ✅ Utiliser une méthode qui ne retourne PAS le password
            const user: UserWithoutPassword | null = await this.service.getByEmailSafe(email);

            if (!user) {
                throw new NotFound('User not found');
            }

            res.json(user);
        } catch (err) {
            next(err);
        }
    }
}

export default new UserController();