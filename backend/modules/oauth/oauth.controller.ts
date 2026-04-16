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
        const platform = req.query.platform === 'mobile' ? 'mobile' : 'web';
        // On récupère l'URL envoyée par le mobile (ou on met une valeur par défaut)
        const redirectUri = req.query.redirect_uri as string;

        passport.authenticate('google', {
            scope: ['profile', 'email'],
            session: false,
            // On stocke les deux infos dans le state (formaté en string)
            state: JSON.stringify({ platform, redirectUri })
        })(req, res, next);
    }

    googleCallback(req: Request, res: Response, next: NextFunction): void {
        // On décode le JSON qu'on a mis dans le state
        const { platform, redirectUri } = JSON.parse(req.query.state as string);

        passport.authenticate('google', { session: false }, (err: Error, user: any) => {
            if (err || !user) {
                return res.redirect(`${redirectUri}?error=auth_failed`);
            }

            const token = this.generateToken(user);

            if (platform === 'mobile' && redirectUri) {
                // MAGIE : On redirige vers l'URL exacte demandée par le mobile (exp://... ou autre)
                return res.redirect(`${redirectUri}?token=${token}`);
            } else {
                return res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
            }
        })(req, res, next);
    }

    // Discord
    discordAuth(req: Request, res: Response, next: NextFunction): void {
        const platform = req.query.platform === 'mobile' ? 'mobile' : 'web';
        const redirectUri = req.query.redirect_uri as string;

        passport.authenticate('discord', {
            session: false,
            // On fait voyager l'objet en le transformant en texte
            state: JSON.stringify({ platform, redirectUri })
        })(req, res, next);
    }

    
    discordCallback(req: Request, res: Response, next: NextFunction): void {
        // On récupère le texte et on le re-transforme en objet
        const stateObj = req.query.state ? JSON.parse(req.query.state as string) : {};
        const platform = stateObj.platform;
        const redirectUri = stateObj.redirectUri;

        passport.authenticate('discord', { session: false }, (err: Error, user: any) => {
            // En cas d'erreur
            if (err || !user) {
                const errorUrl = (platform === 'mobile' && redirectUri)
                    ? `${redirectUri}?error=auth_failed`
                    : `${process.env.FRONTEND_URL}/login?error=auth_failed`;
                return res.redirect(errorUrl);
            }

            const token = this.generateToken(user);

            // En cas de succès
            if (platform === 'mobile' && redirectUri) {
                return res.redirect(`${redirectUri}?token=${token}`);
            } else {
                return res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
            }
        })(req, res, next);
    }

    // Factoriser la génération du token
    private generateToken(user: any): string {
        return jwt.sign(
            { id: user.id, email: user.email, username: user.username, role: user.role },
            process.env.JWT_SECRET!,
            { expiresIn: '24h' }
        );
    }
}

export default new AuthController();