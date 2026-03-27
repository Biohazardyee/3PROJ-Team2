import {BaseMapper} from '../base.mapper.js';
import {Activities} from "../../generated/prisma/client.js";
import {
    ActivityDeleteResponseDto,
    ActivityResponseDto,
    ActivityWithRelationsDto,
} from "../../types/activities/activities.dto.js";
import {Prisma} from '../../generated/prisma/client.js';

type ActivityWithRelations = Prisma.ActivitiesGetPayload<{
    include: { user: true; review: true; media: true }
}>;

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

    toDeleteDto(activity: Activities): ActivityDeleteResponseDto { 
        return {
            id: activity.id,
            user_id: activity.user_id
        }
    }

    toActivityWithRelationsDto(activity: ActivityWithRelations): ActivityWithRelationsDto {
        return {
            id: activity.id,
            user_id: activity.user_id,
            target_user_id: activity.target_user_id,
            review_id: activity.review_id,
            media_id: activity.media_id,
            rating_from_user: activity.rating_from_user,
            action: activity.action,
            created_at: activity.created_at,
            review: activity.review ? { content: activity.review.content } : null,
            media: activity.media ? { content: activity.media.content } : null,
        };
    }

    toActivityWithRelationsDtoList(activities: ActivityWithRelations[]): ActivityWithRelationsDto[] {
        return activities.map(a => this.toActivityWithRelationsDto(a));
    }
}

export const activityMapper = new ActivityMapper();