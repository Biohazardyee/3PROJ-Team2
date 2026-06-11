import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as DiscordStrategy } from 'passport-discord';
import dotenv from 'dotenv';
import { userService } from '../modules/db/users/user.service.js';
import { AuthProvider } from '../generated/prisma/enums.js';

dotenv.config();

// ── Google ──────────────────────────────────────────────
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: process.env.GOOGLE_CALLBACK_URL!,
}, async (accessToken: string, refreshToken: string, profile: any, done: any) => {
    try {
        const user = await userService.findOrCreateOAuthUser({
            provider: AuthProvider.GOOGLE,
            provider_id: profile.id,
            email: profile.emails?.[0].value!,
            username: profile.displayName,
            profile_picture: profile.photos?.[0]?.value ?? null,
        });
        return done(null, user);
    } catch (err) {
        return done(err as Error);
    }
}));

// ── Discord ─────────────────────────────────────────────
passport.use(new DiscordStrategy({
    clientID: process.env.DISCORD_CLIENT_ID!,
    clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    callbackURL: process.env.DISCORD_CALLBACK_URL!,
    scope: ['identify', 'email'],
}, async (accessToken: string, refreshToken: string, profile: any, done: any) => {
    try {
        const user = await userService.findOrCreateOAuthUser({
            provider: AuthProvider.DISCORD,
            provider_id: profile.id,
            email: profile.email!,
            username: profile.username,
            profile_picture: profile.avatar
                ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`
                : null,
        });
        return done(null, user);
    } catch (err) {
        console.error('❌ OAuth Discord error:', err);
        return done(err as Error);
    }
}));

// ── Facebook ─────────────────────────────────────────────
// passport.use(new FacebookStrategy({
//     clientID: process.env.FACEBOOK_APP_ID!,
//     clientSecret: process.env.FACEBOOK_APP_SECRET!,
//     callbackURL: process.env.FACEBOOK_CALLBACK_URL!,
//     profileFields: ['id', 'emails', 'displayName', 'photos'],
// }, async (accessToken: string, refreshToken: string, profile: any, done: any) => {
//     try {
//         const user = await userService.findOrCreateOAuthUser({
//             provider: AuthProvider.FACEBOOK,
//             provider_id: profile.id,
//             email: profile.emails?.[0].value!,
//             username: profile.displayName,
//             profile_picture: profile.photos?.[0]?.value ?? null,  // ✅ plus manquant
//         });
//         return done(null, user);
//     } catch (err) {
//         return done(err as Error);
//     }}));


export default passport;