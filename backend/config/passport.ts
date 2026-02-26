import passport from 'passport';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Strategy as DiscordStrategy } from 'passport-discord';
import dotenv from 'dotenv';
import { userService } from '../modules/db/users/user.service.js';
import { AuthProvider } from '../generated/prisma/enums.js';
import type {OAuthUserDto, UserResponseDto} from '../types/users/user.dto.js';

dotenv.config();

// ===== Discord Strategy =====
passport.use(
    new DiscordStrategy(
        {
            clientID: process.env.DISCORD_CLIENT_ID!,
            clientSecret: process.env.DISCORD_CLIENT_SECRET!,
            callbackURL: process.env.DISCORD_CALLBACK_URL!,
            scope: ['identify', 'email'],
        },
        async (accessToken: string, refreshToken: string, profile, done: any) => {
            try {
                const email = profile.email;

                if (!email) {
                    return done(new Error('No email found in Discord profile'), undefined);
                }

                const oauthUser: OAuthUserDto = {
                    email,
                    username: profile.username || email.split('@')[0],
                    provider: AuthProvider.DISCORD,
                    provider_id: profile.id,
                    profile_picture: `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`
                };

                const user = await userService.findOrCreateOAuthUser(oauthUser);

                return done(null, user);
            } catch (error) {
                return done(error as Error, undefined);
            }
        }
    )
);

// ===== Facebook Strategy =====
passport.use(
    new FacebookStrategy(
        {
            clientID: process.env.FACEBOOK_APP_ID!,
            clientSecret: process.env.FACEBOOK_APP_SECRET!,
            callbackURL: process.env.FACEBOOK_CALLBACK_URL!,
            profileFields: ['id', 'emails', 'name', 'photos'],
        },
        async (accessToken: string, refreshToken: string, profile, done: any) => {
            try {
                const email = profile.emails?.[0]?.value;

                if (!email) {
                    return done(new Error('No email found in Facebook profile'), undefined);
                }

                const oauthUser: OAuthUserDto = {
                    email,
                    username: `${profile.name?.givenName || ''} ${profile.name?.familyName || ''}`.trim() || email.split('@')[0],
                    provider: AuthProvider.FACEBOOK,
                    provider_id: profile.id,
                    profile_picture: profile.photos?.[0]?.value,
                };

                const user: UserResponseDto = await userService.findOrCreateOAuthUser(oauthUser);

                return done(null, user);
            } catch (error) {
                return done(error as Error, undefined);
            }
        }
    )
);

export default passport;