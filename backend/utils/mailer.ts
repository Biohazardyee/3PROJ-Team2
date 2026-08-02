import nodemailer, { Transporter } from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const GMAIL_USER: string | undefined = process.env.GMAIL_USER;
const GMAIL_APP_PASSWORD: string | undefined = process.env.GMAIL_APP_PASSWORD;

let transporter: Transporter | null = null;

function getTransporter(): Transporter {
    if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
        throw new Error('Email sending is not configured (GMAIL_USER / GMAIL_APP_PASSWORD missing)');
    }

    if (!transporter) {
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: GMAIL_USER,
                pass: GMAIL_APP_PASSWORD,
            },
        });
    }

    return transporter;
}

export async function sendVerificationEmail(to: string, code: string): Promise<void> {
    await getTransporter().sendMail({
        from: `"Melodia" <${GMAIL_USER}>`,
        to,
        subject: 'Vérifie ton adresse email — Melodia',
        html: `
            <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; color: #1a1b26;">
                <h2 style="margin-bottom: 4px;">Bienvenue sur Melodia 🎧</h2>
                <p>Voici ton code de vérification :</p>
                <p style="font-size: 32px; font-weight: bold; letter-spacing: 8px; text-align: center; background: #f3f0ff; color: #7c3aed; padding: 16px; border-radius: 12px;">${code}</p>
                <p style="color: #666; font-size: 14px;">Ce code expire dans 15 minutes. Si tu n'es pas à l'origine de cette inscription, ignore simplement cet email.</p>
            </div>
        `,
    });
}

export async function sendPasswordResetEmail(to: string, code: string): Promise<void> {
    await getTransporter().sendMail({
        from: `"Melodia" <${GMAIL_USER}>`,
        to,
        subject: 'Réinitialisation de ton mot de passe — Melodia',
        html: `
            <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; color: #1a1b26;">
                <h2 style="margin-bottom: 4px;">Réinitialisation de mot de passe 🔒</h2>
                <p>Voici ton code pour choisir un nouveau mot de passe :</p>
                <p style="font-size: 32px; font-weight: bold; letter-spacing: 8px; text-align: center; background: #f3f0ff; color: #7c3aed; padding: 16px; border-radius: 12px;">${code}</p>
                <p style="color: #666; font-size: 14px;">Ce code expire dans 15 minutes. Si tu n'es pas à l'origine de cette demande, ignore simplement cet email : ton mot de passe restera inchangé.</p>
            </div>
        `,
    });
}
