import {User} from "../generated/prisma/client.js";

export type UserWithoutPassword = Omit<User, 'password'>;

export interface UserRegistrationDto {
    email: string;
    username: string;
    password: string;
    favorite_band: string;
}

export interface UserUpdateDto {
    username?: string;
    password?: string;
    phone_number?: string | null;
    biography?: string | null;
    favorite_band?: string | null;
    has_notifications?: boolean;
    profile_picture?: string | null;
}

export interface LoginDto {
    email: string;
    password: string;
}