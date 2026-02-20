// mappers/user.mapper.ts
import type {Users} from '../../generated/prisma/browser.js';
import {
    UserResponseAddDto,
    UserResponseDeleteDto,
    UserResponseDto,
    UserResponseLoginDto,
} from '../../types/users/user.dto.js';
import {BaseMapper} from '../base.mapper.js';

export class UserMapper extends BaseMapper<Users, UserResponseDto> {

    /**
     * Implémentation de la méthode abstraite
     */
    protected mapOne(user: Users): UserResponseDto {
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

    /**
     * Mapper spécifique pour le login
     */
    toLoginDto(user: Users): UserResponseLoginDto {
        return {
            id: user.id,
            email: user.email,
            username: user.username,
            role: user.role,
        };
    }

    toAddDto(user: Users): UserResponseAddDto {
        return {
            id: user.id,
            username: user.username,
            created_at: user.created_at,
        }
    }

    /**
     * Mapper spécifique pour le delete
     */
    toDeleteDto(user: Users): UserResponseDeleteDto {
        return {
            id: user.id,
            email: user.email,
            username: user.username,
        };
    }

    /**
     * Mapper pour profil public (moins d'infos)
     */
    toPublicDto(user: Users) {
        return {
            id: user.id,
            username: user.username,
            biography: user.biography,
            favorite_band: user.favorite_band,
            profile_picture: user.profile_picture,
            created_at: user.created_at,
        };
    }
}

export const userMapper = new UserMapper();