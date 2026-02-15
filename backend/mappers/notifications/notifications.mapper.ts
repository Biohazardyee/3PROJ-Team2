import {
    NotificationsCreationResponseDto, NotificationsResponseDeleteDto,
    NotificationsResponseDto
} from "../../types/notifications/notifications.dto.js";
import {BaseMapper} from "../base.mapper.js";
import {Notifications} from "../../generated/prisma/browser.js";

class NotificationsMapper extends BaseMapper<Notifications, NotificationsResponseDto> {
    protected mapOne(notification: Notifications): NotificationsResponseDto {
        return {
            id: notification.id,
            user_id: notification.user_id,
            action: notification.action,
            related_user_id: notification.related_user_id,
            review_id: notification.review_id,
            media_id: notification.media_id,
            is_read: notification.is_read,
            read_at: notification.read_at,
            created_at: notification.created_at
        }
    }

    toAddDto(notification: Notifications): NotificationsCreationResponseDto {
        return {
            user_id: notification.user_id,
            action: notification.action,
            related_user_id: notification.related_user_id,
            review_id: notification.review_id,
            media_id: notification.media_id,
            created_at: notification.created_at
        }
    }

    toDeleteDto(notification : Notifications): NotificationsResponseDeleteDto {
        return {
            id: notification.id,
        }
    }
}

export const notificationsMapper = new NotificationsMapper();