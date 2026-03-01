import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import passport from '../../config/passport.js';

class AuthController {

    // /**
    //  * ✅ Initie l'authentification Facebook
    //  */
    // facebookAuth(req: Request, res: Response, next: NextFunction): void {
    //     passport.authenticate('facebook', {
    //         scope: ['email'],
    //         session: false
    //     })(req, res, next);
    // }
    //
    // /**
    //  * ✅ Callback Facebook OAuth
    //  */
    // facebookCallback(req: Request, res: Response, next: NextFunction): void {
    //     passport.authenticate('facebook', {
    //         session: false,
    //         failureRedirect: `${process.env.FRONTEND_URL}/login?error=auth_failed`
    //     }, (err: Error, user: any) => {
    //         if (err || !user) {
    //             return res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
    //         }
    //
    //         const token: string = jwt.sign(
    //             {
    //                 id: user.id,
    //                 email: user.email,
    //                 username: user.username,
    //                 role: user.role,
    //             },
    //             process.env.JWT_SECRET!,
    //             {
    //                 expiresIn: '1h'
    //             }
    //         );
    //
    //         res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
    //     })(req, res, next);
    // }

    // Google
    googleAuth(req: Request, res: Response, next: NextFunction): void {
        passport.authenticate('google', {
            scope: ['profile', 'email'],
            session: false
        })(req, res, next);
    }

    googleCallback(req: Request, res: Response, next: NextFunction): void {
        passport.authenticate('google', {
            session: false,
            failureRedirect: `${process.env.FRONTEND_URL}/login?error=auth_failed`
        }, (err: Error, user: any) => {
            if (err || !user) {
                return res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
            }
            const token = this.generateToken(user);
            res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
        })(req, res, next);
    }

// Discord
    discordAuth(req: Request, res: Response, next: NextFunction): void {
        passport.authenticate('discord', { session: false })(req, res, next);
    }

    discordCallback(req: Request, res: Response, next: NextFunction): void {
        passport.authenticate('discord', {
            session: false,
            failureRedirect: `${process.env.FRONTEND_URL}/login?error=auth_failed`
        }, (err: Error, user: any) => {
            if (err || !user) {
                return res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
            }
            const token = this.generateToken(user);
            res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
        })(req, res, next);
    }

    // Factoriser la génération du token
    private generateToken(user: any): string {
        return jwt.sign(
            { id: user.id, email: user.email, username: user.username, role: user.role },
            process.env.JWT_SECRET!,
            { expiresIn: '1h' }
        );
    }
}

export default new AuthController();