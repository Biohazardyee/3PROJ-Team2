// src/modules/users/dto/user.dto.ts
import { z } from 'zod';

// ----------------------
// Input DTO (création / update)
// ----------------------
export const CreateUserDto = z.object({
    id: z.string(),
    username: z.string().min(1),
    email: z.email(),
    password_hash: z.string().min(6),
    phone_number: z.string().nullable(),
    profile_picture: z.url().nullable(),
    role: z.enum(['USER', 'ADMIN']).optional(),
    biography: z.string().nullable(),
    favorite_band: z.string(),
    has_notifications: z.boolean().optional(),
});

export const UpdateUserDto = CreateUserDto.partial();

// ----------------------
// Output DTO (PublicUser)
// ----------------------
export const PublicUserDto = z.object({
    id: z.string(),
    email: z.email(),
    username: z.string(),
    phone_number: z.string().nullable(),
    role: z.enum(['USER', 'ADMIN']),
    profile_picture: z.string().nullable(),
    biography: z.string().nullable(),
    favorite_band: z.string().nullable(),
    has_notifications: z.boolean(),
    created_at: z.date(),
    updated_at: z.date(),
});

// ----------------------
// TypeScript types inferred
// ----------------------
export type CreateUserInput = z.infer<typeof CreateUserDto>;
export type UpdateUserInput = z.infer<typeof UpdateUserDto>;
export type PublicUser = z.infer<typeof PublicUserDto>;
