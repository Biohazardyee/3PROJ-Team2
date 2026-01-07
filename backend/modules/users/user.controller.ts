import type { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

import { Controller } from '../controller.js';
import { Unauthorized, BadRequest } from '../../utils/errors.js';
import { userService } from './user.service.js';

import { NotFound } from '../../utils/errors.js';

dotenv.config();

class UserController extends Controller {

    constructor(private readonly service = userService) {
        super();
    }

    // =========================
    // CREATE USER
    // =========================
    async add(req: Request, res: Response, next: NextFunction) {
        try {
            const {
                email,
                username,
                password,
                role,
                phone_number,
                biography,
                favorite_band,
                has_notifications,
            } = req.body;

            if (!email || !username || !password) {
                throw new BadRequest('Missing required fields');
            }

            const password_hash = await bcrypt.hash(password, 10);
            const profile_picture = (req as any).file?.buffer ?? null;

            const user = await this.service.create({
                email,
                username,
                password_hash,
                role,
                phone_number,
                biography,
                favorite_band,
                has_notifications,
                profile_picture,
                created_at: new Date(),
                updated_at: new Date(),
            });

            res.status(201).json({
                message: 'User created successfully',
                user,
            });
        } catch (err) {
            next(err);
        }
    }

    // =========================
    // LOGIN
    // =========================
    async login(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                throw new BadRequest('Email and password required');
            }

            const user = await this.service.getByEmail(email);
            if (!user) {
                throw new Unauthorized('Invalid email or password');
            }

            const isValid = await bcrypt.compare(password, user.password_hash);
            if (!isValid) {
                throw new Unauthorized('Invalid email or password');
            }

            const token = jwt.sign(
                {
                    id: user.id,
                    email: user.email,
                    username: user.username,
                    role: user.role,
                },
                process.env.JWT_SECRET!,
                { expiresIn: '1h' }
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

    async getAll(_: Request, res: Response, next: NextFunction) {
        try {
            const users = await this.service.getAll();
            res.json(users);
        } catch (err) {
            next(err);
        }
    }

    async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const user = await this.service.getById(req.params.id);
            res.json(user);
        } catch (err) {
            next(err);
        }
    }

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const { password, ...rest } = req.body;

            const data: any = { ...rest };

            if (password) {
                data.password_hash = await bcrypt.hash(password, 10);
            }

            const user = await this.service.update(req.params.id, data);

            res.json({
                message: 'User updated successfully',
                user,
            });
        } catch (err) {
            next(err);
        }
    }

    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const user = await this.service.delete(req.params.id);

            res.json({
                message: 'User deleted successfully',
                user,
            });
        } catch (err) {
            next(err);
        }
    }

    async getByEmail(req: Request, res: Response, next: NextFunction) {
        try {
            const user = await this.service.getByEmail(req.params.email);
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
