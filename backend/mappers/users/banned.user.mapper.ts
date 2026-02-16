import { BaseMapper } from '../base.mapper.js';
import { BannedUsers } from "../../generated/prisma/browser.js";
import { BannedUserDeleteDto, BannedUserResponseDto } from "../../types/users/banned.user.dto.js";

class BannedUserMapper extends BaseMapper<BannedUsers, BannedUserResponseDto> {

    /**
     * Implémentation de la méthode abstraite
     */
    protected mapOne(bannedUser: BannedUsers): BannedUserResponseDto {
        return {
            id: bannedUser.id,
            user_id: bannedUser.user_id,
            username: bannedUser.username,
            email: bannedUser.email,
            content: bannedUser.content,
            created_at: bannedUser.created_at,
        };
    }

    toAddDto(bannedUser: BannedUsers): BannedUserResponseDto {
        return {
            id: bannedUser.id,
            user_id: bannedUser.user_id,
            username: bannedUser.username,
            email: bannedUser.email,
            content: bannedUser.content,
            created_at: bannedUser.created_at,
        };
    }


    toDeleteDto(bannedUser: BannedUsers): BannedUserDeleteDto {
        return {
            id: bannedUser.id,
            user_id: bannedUser.user_id
        }
    }
}

export const bannedUserMapper = new BannedUserMapper();