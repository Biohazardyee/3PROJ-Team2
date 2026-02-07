import {BaseMapper} from '../base.mapper';
import {BannedUsers} from "../../generated/prisma/browser";
import {BannedUserDeleteDto, BannedUserResponseDto} from "../../types/users/bannedUser.dto";

class BannedUserMapper extends BaseMapper<BannedUsers, BannedUserResponseDto> {

    /**
     * Implémentation de la méthode abstraite
     */
    protected mapOne(bannedUser: BannedUsers): BannedUserResponseDto {
        return {
            id: bannedUser.id,
            user_id: bannedUser.user_id,
            content: bannedUser.content,
            created_at: bannedUser.created_at,
        };
    }


    toAddDto(bannedUser: BannedUsers): BannedUserResponseDto {
        return {
            id: bannedUser.id,
            user_id: bannedUser.user_id,
            content: bannedUser.content,
            created_at: bannedUser.created_at,
        }
    }

    toDeleteDto(bannedUser: BannedUsers): BannedUserDeleteDto{
        return {
            id: bannedUser.id,
            user_id: bannedUser.user_id
        }
    }
}

export default BannedUserMapper

export const bannedUserMapper = new BannedUserMapper();