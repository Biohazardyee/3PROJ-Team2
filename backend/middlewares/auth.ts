import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Unauthorized } from '../utils/errors.js';



export function authGuard(req: Request, _res: Response, next: NextFunction): void {
    const authHeader: string | undefined = req.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new Unauthorized('Authorization header manquant ou invalide'));
    }

    const token: string = authHeader.split(' ')[1].replace(/#.*$/, '').trim();
    
    if (!token) {
        return next(new Unauthorized('Missing token'));
    }

    try {

        const secret = process.env.JWT_SECRET;

        if (!secret) {
            console.error("ERREUR FATALE: JWT_SECRET n'est pas chargé.");
            return next(new Unauthorized('Server configuration error'));
        }


        (req as any).user = jwt.verify(token, secret);
        next();
    } catch (err) {

        console.error("JWT Verification Error:", (err as Error).message);
        return next(new Unauthorized('Expired or invalid token'));
    }
}