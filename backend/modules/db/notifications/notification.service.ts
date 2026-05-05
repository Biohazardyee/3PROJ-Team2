import { PrismaDb } from "../../../config/database.js";
import { BadRequest, NotFound } from "../../../utils/errors.js";
import { isEmptyString, isValidBoolean } from "../../../utils/helpers.js";
import { NotificationActions } from "../../../generated/prisma/enums.js";
import {
  NotificationsCreationDto,
  NotificationsCreationResponseDto,
  NotificationsResponseDeleteDto,
  NotificationsResponseDto,
  NotificationsUpdateDto,
} from "../../../types/notifications/notifications.dto.js";
import {
  Medias,
  Reviews,
  Users,
  Prisma,
  Notifications,
} from "../../../generated/prisma/browser.js";
import { notificationsMapper } from "../../../mappers/notifications/notifications.mapper.js";
import { sendPushNotification } from "./notification.push.js";
import { generateNotificationContent } from "./notification.helper.js";

export class NotificationService {
  async create(
    data: NotificationsCreationDto,
  ): Promise<NotificationsCreationResponseDto> {
    if (isEmptyString(data.user_id)) {
      throw new BadRequest("user_id cannot be empty");
    }

    if (
      !data.action ||
      !Object.values(NotificationActions).includes(data.action)
    ) {
      throw new BadRequest("Invalid notification action");
    }

    const user: Users | null = await PrismaDb.users.findUnique({
      where: {
        id: data.user_id,
      },
    });

    if (!user) {
      throw new BadRequest("User not found");
    }

    if (data.related_user_id !== undefined) {
      const relatedUser: Users | null = await PrismaDb.users.findUnique({
        where: {
          id: data.related_user_id,
        },
      });

      if (!relatedUser) {
        throw new BadRequest("Related user not found");
      }
    }

    if (data.review_id !== undefined) {
      const review: Reviews | null = await PrismaDb.reviews.findUnique({
        where: {
          id: data.review_id,
        },
      });
      if (!review) {
        throw new BadRequest("Review not found");
      }
    }

    if (data.media_id !== undefined) {
      const media: Medias | null = await PrismaDb.medias.findUnique({
        where: {
          id: data.media_id,
        },
      });
      if (!media) {
        throw new BadRequest("Media not found");
      }
    }

    const notification = await PrismaDb.notifications.create({
      data: {
        user_id: data.user_id,
        action: data.action,
        related_user_id: data.related_user_id,
        review_id: data.review_id,
        media_id: data.media_id,
      },
      include: {
        related_user: { select: { username: true } },
      },
    });

    const { title, body } = generateNotificationContent(notification);

    if (user.expo_push_token) {
      sendPushNotification(user.expo_push_token, title, body, {
        action: data.action,
        id: notification.id,
      }).catch((err) => console.error("Push failed", err));
    }

    return notificationsMapper.toAddDto(notification);
  }

  async getByUserId(id: string): Promise<NotificationsResponseDto[]> {
    if (isEmptyString(id)) {
      throw new BadRequest("user_id cannot be empty");
    }

    const user: Users | null = await PrismaDb.users.findUnique({
      where: {
        id: id,
      },
    });

    if (!user) {
      throw new NotFound("User not found");
    }

    const userNotifications = await PrismaDb.notifications.findMany({
      where: {
        user_id: id,
      },
      include: {

        related_user: {
          select: {
            username: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    return notificationsMapper.toDtoList(userNotifications);
  }

  async update(
    id: string,
    data: NotificationsUpdateDto,
  ): Promise<NotificationsResponseDto> {
    if (isEmptyString(id)) {
      throw new BadRequest("Notification id cannot be empty");
    }

    const notification: Notifications | null =
      await PrismaDb.notifications.findUnique({
        where: {
          id: id,
        },
      });

    if (!notification) {
      throw new NotFound("Notification not found");
    }

    const updateData: Prisma.NotificationsUpdateInput = {};

    if (data.is_read !== undefined) {
      if (!isValidBoolean(data.is_read)) {
        throw new BadRequest("is_read must be a boolean");
      }
      updateData.is_read = data.is_read;

      if (data.is_read) {
        updateData.read_at = new Date();
      } else {
        updateData.read_at = null;
      }
    }

    const notificationToUpdate: Notifications =
      await PrismaDb.notifications.update({
        where: {
          id,
        },
        data: updateData,
      });

    return notificationsMapper.toDto(notificationToUpdate);
  }

  async getAll(): Promise<NotificationsResponseDto[]> {
    const notifications: Notifications[] =
      await PrismaDb.notifications.findMany({
        orderBy: {
          created_at: "desc",
        },
      });

    return notificationsMapper.toDtoList(notifications);
  }

  async getById(id: string): Promise<NotificationsResponseDto> {
    if (isEmptyString(id)) {
      throw new BadRequest("Notification id cannot be empty");
    }

    const notification: Notifications | null =
      await PrismaDb.notifications.findUnique({
        where: {
          id,
        },
      });

    if (!notification) {
      throw new NotFound("Notification not found");
    }

    return notificationsMapper.toDto(notification);
  }

  async delete(id: string): Promise<NotificationsResponseDeleteDto> {
    if (isEmptyString(id)) {
      throw new BadRequest("Notification id cannot be empty");
    }

    const notification: Notifications | null =
      await PrismaDb.notifications.findUnique({
        where: {
          id,
        },
      });

    if (!notification) {
      throw new NotFound("Notification not found");
    }

    const notificationToDelete: Notifications =
      await PrismaDb.notifications.delete({
        where: {
          id,
        },
      });

    return notificationsMapper.toDeleteDto(notificationToDelete);
  }
}

export const notificationService = new NotificationService();
