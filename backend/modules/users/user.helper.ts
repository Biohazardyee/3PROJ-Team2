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