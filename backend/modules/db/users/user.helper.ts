import {PrismaDb} from "../../../config/database.js";
import { Users } from "../../../generated/prisma/client.js";

const EMAIL_REGEX =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PASSWORD_REGEX =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

export function isValidEmail(email: string): boolean {
    return EMAIL_REGEX.test(email);
}

export function isValidPassword(password: string): boolean {
    return PASSWORD_REGEX.test(password);
}

export function isValidUsername(username: string): boolean {
    return /^[a-zA-Z0-9_-]{3,30}$/.test(username);
}

export async function generateUniqueUsername(baseUsername: string): Promise<string> {
    let username: string = baseUsername.replace(/[^a-zA-Z0-9_-]/g, '').substring(0, 30);
    let suffix: number  = 0;

    while (true) {
    const testUsername: string = suffix === 0 ? username : `${username}${suffix}`;
    const exists: Users | null = await PrismaDb.users.findUnique({
        where: { username: testUsername }
    });
    if (!exists) return testUsername;
    suffix++;
}}