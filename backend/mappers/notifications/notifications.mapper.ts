import {
  NotificationsCreationResponseDto,
  NotificationsResponseDeleteDto,
  NotificationsResponseDto,
} from "../../types/notifications/notifications.dto.js";
import { BaseMapper } from "../base.mapper.js";
import { Notifications } from "../../generated/prisma/browser.js";

class NotificationsMapper extends BaseMapper<
  Notifications,
  NotificationsResponseDto
> {
  formatImage = (profile_picture: any) => {
    if (!profile_picture) return null;

    if (typeof profile_picture === "string") return profile_picture;

    let base64String = "";

    if (Buffer.isBuffer(profile_picture)) {
      base64String = profile_picture.toString("base64");
    } else if (profile_picture instanceof Uint8Array) {
      base64String = Buffer.from(profile_picture).toString("base64");
    } else if (Array.isArray(profile_picture)) {
      base64String = Buffer.from(profile_picture).toString("base64");
    } else {
      return null;
    }

    return `data:image/jpeg;base64,${base64String}`;
  };

  protected mapOne(notification: any): NotificationsResponseDto {
    return {
      id: notification.id,
      user_id: notification.user_id,
      action: notification.action,
      related_user_id: notification.related_user_id,
      related_user: notification.related_user
        ? {
            username: notification.related_user.username,
            profile_image: this.formatImage(
              notification.related_user.profile_picture,
            ),
          }
        : null,
      review_id: notification.review_id,
      media_id: notification.media_id,
      is_read: notification.is_read,
      read_at: notification.read_at,
      created_at: notification.created_at,
    };
  }

  toAddDto(notification: Notifications): NotificationsCreationResponseDto {
    return {
      user_id: notification.user_id,
      action: notification.action,
      related_user_id: notification.related_user_id,
      review_id: notification.review_id,
      media_id: notification.media_id,
      created_at: notification.created_at,
    };
  }

  toDeleteDto(notification: Notifications): NotificationsResponseDeleteDto {
    return {
      id: notification.id,
    };
  }
}

export const notificationsMapper = new NotificationsMapper();
