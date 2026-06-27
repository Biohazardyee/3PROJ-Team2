// mappers/user.mapper.ts
import type { Users } from "../../generated/prisma/browser.js";
import {
  UserPublicDto,
  UserResponseAddDto,
  UserResponseDeleteDto,
  UserResponseDto,
  UserResponseLoginDto,
} from "../../types/users/user.dto.js";
import { BaseMapper } from "../base.mapper.js";

export class UserMapper extends BaseMapper<Users, UserResponseDto> {
  /**
   * Implémentation de la méthode abstraite
   */
  protected mapOne(user: Users): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      pseudo: user.pseudo,
      role: user.role,
      phone_number: user.phone_number,
      biography: user.biography,
      favorite_band: user.favorite_band,
      shop_points: user.shop_points ?? 0,
      owned_cosmetics: user.owned_cosmetics ?? [],
      equipped_avatar_border: user.equipped_avatar_border ?? null,
      has_notifications: user.has_notifications ?? true,
      profile_picture: user.profile_picture,
      banner: user.banner,
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
    };
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
  toPublicDto(user: Users): UserPublicDto {
    return {
      id: user.id,
      username: user.username,
      pseudo: user.pseudo,
      biography: user.biography,
      favorite_band: user.favorite_band,
      profile_picture: user.profile_picture
        ? Buffer.from(user.profile_picture).toString("base64")
        : null,
      banner: user.banner
        ? Buffer.from(user.banner).toString("base64")
        : null,
      shop_points: user.shop_points ?? 0,
      owned_cosmetics: user.owned_cosmetics ?? [],
      equipped_avatar_border: user.equipped_avatar_border ?? null,
      created_at: user.created_at,
    };
  }
}

export const userMapper = new UserMapper();
