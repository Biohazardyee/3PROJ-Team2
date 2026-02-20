import {BaseMapper} from '../base.mapper.js';
import {Activities} from "../../generated/prisma/client.js";
import {
    ActivityDeleteResponseDto,
    ActivityResponseDto,

} from "../../types/activities/activities.dto.js";

class ActivityMapper extends BaseMapper<Activities, ActivityResponseDto> {

    protected mapOne(activity: Activities): ActivityResponseDto {
        return {
            id: activity.id,
            user_id: activity.user_id,
            target_user_id: activity.target_user_id,
            review_id: activity.review_id,
            media_id: activity.media_id,
            rating_from_user: activity.rating_from_user,
            action: activity.action,
            created_at: activity.created_at
        };
    }

    ToDeleteDto(activity: Activities): ActivityDeleteResponseDto {
        return {
            id: activity.id,
            user_id: activity.user_id
        }
    }

}

export const activityMapper = new ActivityMapper();