import {BaseMapper} from "../base.mapper.js";
import {Follows} from "../../generated/prisma/client.js";
import {FollowResponseDto} from "../../types/follows/follows.dto.js";

class FollowsMapper extends BaseMapper<Follows, FollowResponseDto> {
    mapOne(follow: Follows): FollowResponseDto {
        return {
            user_id: follow.user_id,
            follow_user_id: follow.follow_user_id,
            created_at: follow.created_at
        }
    }
}

export const followsMapper = new FollowsMapper();