import type { User } from '../generated/prisma/browser.js';
import type { UserResponseDto } from '../types/user.dto.js';

export class UserMapper {

    /**
     * Convertit un User Prisma en UserResponseDto (réponse complète)
     */
    static toResponseDto(user: User): UserResponseDto {
        return {
            id: user.id,
            email: user.email,
            username: user.username,
            role: user.role,
            phone_number: user.phone_number,
            biography: user.biography,
            favorite_band: user.favorite_band,
            has_notifications: user.has_notifications ?? true,
            profile_picture: user.profile_picture,
            created_at: user.created_at,
            updated_at: user.updated_at,
        };
    }

    static toResponseDtos(users: User[]): UserResponseDto[] {
        return users.map(this.toResponseDto);
    }

    /**
     * Pour le login (minimal)
     */
    static toLoginDto(user: User) {
        return {
            id: user.id,
            email: user.email,
            username: user.username,
            role: user.role,
        };
    }
}