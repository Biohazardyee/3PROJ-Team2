import { NotificationActions } from "../../generated/prisma/enums.js";

export interface NotificationsResponseDto {
  id: string;
  user_id: string;
  action: NotificationActions;
  related_user_id?: string | null;
  related_user?: {
    username: string;
  } | null;
  review_id?: string | null;
  media_id?: string | null;
  is_read: boolean;
  read_at?: Date | null;
  created_at: Date;
}

export interface NotificationsResponseDeleteDto {
  id: string;
}

export interface NotificationsCreationDto {
  user_id: string;
  action: NotificationActions;
  related_user_id?: string;
  review_id?: string;
  media_id?: string;
}

export interface NotificationsUpdateDto {
  is_read?: boolean;
}

export interface NotificationsCreationResponseDto {
  user_id: string;
  action: NotificationActions;
  related_user_id?: string | null;
  review_id?: string | null;
  media_id?: string | null;
  created_at: Date;
}
