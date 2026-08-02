import {
  NotificationsCreationResponseDto,
  NotificationsResponseDeleteDto,
  NotificationsResponseDto,
} from "../../types/notifications/notifications.dto.js";
import { BaseMapper } from "../base.mapper.js";
import { Notifications } from "../../generated/prisma/browser.js";
import { bufferToImageDataUri } from "../../utils/imageDataUri.js";

class NotificationsMapper extends BaseMapper<
  Notifications,
  NotificationsResponseDto
> {
  formatImage = (profile_picture: any) => {
    if (!profile_picture) return null;

    if (typeof profile_picture === "string") return profile_picture;

    if (
      Buffer.isBuffer(profile_picture) ||
      profile_picture instanceof Uint8Array ||
      Array.isArray(profile_picture)
    ) {
      return bufferToImageDataUri(Buffer.from(profile_picture));
    }

    return null;
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
            pseudo: notification.related_user.pseudo ?? null,
            profile_image: this.formatImage(
              notification.related_user.profile_picture,
            ),
            equipped_avatar_border: notification.related_user.equipped_avatar_border ?? null,
            equipped_font: notification.related_user.equipped_font ?? null,
            equipped_text_effect: notification.related_user.equipped_text_effect ?? null,
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
