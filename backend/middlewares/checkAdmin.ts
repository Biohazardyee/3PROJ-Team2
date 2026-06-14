import {Request, Response, NextFunction} from 'express';
import {BadRequest, Forbidden} from '../utils/errors.js';

export function checkAdmin(
    req: Request,
    _: Response,
    next: NextFunction
): void {
    const user = req.user;

    if (!user) {
        return next(new BadRequest('User not authenticated'));
    }

    if (user.role !== 'ADMIN') {
        return next(new Forbidden('Access denied: admin only'));
    }

    next();
}
