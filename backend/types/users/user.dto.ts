import {Roles} from '../../generated/prisma/enums.js';
import type { AuthProvider } from '../../generated/prisma/enums.js';

// Response Interface
export interface UserResponseDto {
    id: string;
    username: string;
    email: string;
    phone_number: string | null;
    profile_picture: Uint8Array<ArrayBuffer> | null;
    role: Roles;
    biography: string | null;
    favorite_band: string | null;
    has_notifications: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface TokenPayloadDto {
    id: string;
    email: string;
    username: string;
    role: string;
}

export interface UserResponseLoginDto {
    id: string,
    email: string;
    username: string,
    role: Roles,
}

export interface UserResponseDeleteDto {
    id: string,
    email: string;
    username: string,
}

export interface UserResponseAddDto {
    id: string;
    username: string;
    created_at: Date;
}

export interface UserPublicDto {
    id: string;
    username: string;
    biography: string | null;
    favorite_band: string | null;
    profile_picture: string | null;
    created_at: Date;
}

// Post Interface
export interface UserRegistrationDto {
    email: string;
    username: string;
    password: string;
    favorite_band: string;
    profile_picture: Uint8Array<ArrayBuffer>;
}

export interface OAuthUserDto {
    email: string;
    username?: string;
    provider: AuthProvider;
    provider_id: string;
    profile_picture?: string | null;
}

export interface UserUpdateDto {
    email?: string;
    username?: string;
    password?: string;
    oldPassword?: string;
    phone_number?: string | null;
    biography?: string | null
    favorite_band?: string
    has_notifications?: boolean;
    profile_picture?: string | null;
}

export interface LoginDto {
    email: string;
    password: string;
}

export type SelectableUserField =
    | 'id'
    | 'email'
    | 'username'
    | 'role'
    | 'phone_number'
    | 'biography'
    | 'favorite_band'
    | 'has_notifications'
    | 'profile_picture'
    | 'created_at'
    | 'updated_at';

export interface UserFieldsQuery {
    fields: SelectableUserField[];
}

export interface SocketUser {
    id: string;
    email: string;
    username: string;
    role: string;
}

export type PartialUserResponseDto = Partial<UserResponseDto>;
