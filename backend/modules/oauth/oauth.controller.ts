import type {Request, Response, NextFunction} from 'express';
import jwt from 'jsonwebtoken';
import passport from '../../config/passport.js';

class AuthController {
    googleAuth(req: Request, res: Response, next: NextFunction): void {
        const platform: "mobile" | "web" = req.query.platform === 'mobile' ? 'mobile' : 'web';
        const redirectUri = req.query.redirect_uri as string;

        passport.authenticate('google', {
            scope: ['profile', 'email'],
            session: false,
            state: JSON.stringify({platform, redirectUri})
        })(req, res, next);
    }

    googleCallback(req: Request, res: Response, next: NextFunction): void {
        const {platform, redirectUri} = JSON.parse(req.query.state as string);

        passport.authenticate('google', {session: false}, (err: Error, user: any): void => {
            if (err || !user) {
                return res.redirect(`${redirectUri}?error=auth_failed`);
            }

            const token: string = this.generateToken(user);

            if (platform === 'mobile' && redirectUri) {
                return res.redirect(`${redirectUri}?token=${token}`);
            } else {
                return res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
            }
        })(req, res, next);
    }

    // Discord
    discordAuth(req: Request, res: Response, next: NextFunction): void {
        const platform: "mobile" | "web" = req.query.platform === 'mobile' ? 'mobile' : 'web';
        const redirectUri = req.query.redirect_uri as string;

        passport.authenticate('discord', {
            session: false,
            state: JSON.stringify({platform, redirectUri})
        })(req, res, next);
    }


    discordCallback(req: Request, res: Response, next: NextFunction): void {
        const stateObj: any = req.query.state ? JSON.parse(req.query.state as string) : {};
        const platform: any = stateObj.platform;
        const redirectUri: any = stateObj.redirectUri;

        passport.authenticate('discord', {session: false}, (err: Error, user: any): void => {
            if (err || !user) {
                const errorUrl: string = (platform === 'mobile' && redirectUri)
                    ? `${redirectUri}?error=auth_failed`
                    : `${process.env.FRONTEND_URL}/login?error=auth_failed`;
                return res.redirect(errorUrl);
            }

            const token = this.generateToken(user);

            if (platform === 'mobile' && redirectUri) {
                return res.redirect(`${redirectUri}?token=${token}`);
            } else {
                return res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
            }
        })(req, res, next);
    }

    private generateToken(user: any): string {
        return jwt.sign(
            {id: user.id, email: user.email, username: user.username, role: user.role},
            process.env.JWT_SECRET!,
            {expiresIn: '24h'}
        );
    }
}

export default new AuthController();