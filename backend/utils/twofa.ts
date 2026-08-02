import {authenticator} from 'otplib';
import QRCode from 'qrcode';
import crypto from 'crypto';

const ISSUER = 'Melodia';
const BACKUP_CODE_COUNT = 10;

export function generateTwoFactorSecret(): string {
    return authenticator.generateSecret();
}

export function verifyTwoFactorToken(token: string, secret: string): boolean {
    try {
        return authenticator.check(token, secret);
    } catch {
        return false;
    }
}

export async function generateTwoFactorQrCode(email: string, secret: string): Promise<string> {
    const otpAuthUrl: string = authenticator.keyuri(email, ISSUER, secret);
    return QRCode.toDataURL(otpAuthUrl);
}

/**
 * Génère des codes de secours 2FA (8 caractères hexadécimaux chacun).
 * Ils sont retournés en clair pour être affichés une seule fois à l'utilisateur ;
 * seule leur version hachée (bcrypt, côté service) doit être persistée.
 */
export function generateBackupCodes(count: number = BACKUP_CODE_COUNT): string[] {
    return Array.from({length: count}, (): string =>
        crypto.randomBytes(4).toString('hex').toUpperCase(),
    );
}

/**
 * Normalise une saisie utilisateur (avec ou sans tiret, casse quelconque)
 * vers le format brut utilisé pour le hachage/la comparaison.
 */
export function normalizeBackupCode(code: string): string {
    return code.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
}
