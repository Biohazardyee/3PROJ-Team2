import {Request, Response, NextFunction} from 'express';
import {BadRequest, Forbidden} from '../utils/errors.js';

export function checkAdminOrSelf(req: Request, _: Response, next: NextFunction): void {
    try {

        const loggedUser = req.user;

        if (!loggedUser) {
            throw new BadRequest("User not authenticated");
        }

        const targetUserId: string = req.params.id;
        const isAdmin: boolean = loggedUser.role === 'ADMIN';

        if (isAdmin || loggedUser.id === targetUserId) {
            return next();
        }

        throw new Forbidden("Access denied: admin or self only");

    } catch (err) {
        next(err);
    }
}
