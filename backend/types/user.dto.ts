import {Role} from '../generated/prisma/enums';

// Response Interface
export interface UserResponseDto {
    id: string;
    username: string;
    email: string;
    phone_number: string | null;
    profile_picture: Uint8Array<ArrayBuffer>;
    role: Role;
    biography: string | null;
    favorite_band: string;
    has_notifications: boolean;
    created_at: Date;
    updated_at: Date
}

export interface UserResponseLoginDto {
    id: string,
    email: string;
    username: string,
    role: Role,
}

// Post Interface
export interface UserRegistrationDto {
    email: string;
    username: string;
    password: string;
    favorite_band: string;
    profile_picture: Uint8Array<ArrayBuffer>;
}

export interface UserUpdateDto {
    email?: string;
    username?: string;
    password?: string;
    role?: Role;
    phone_number?: string | null;
    biography?: string | null
    favorite_band?: string
    has_notifications?: boolean;
    profile_picture?: Uint8Array<ArrayBuffer>;
}

export interface LoginDto {
    email: string;
    password: string;
}