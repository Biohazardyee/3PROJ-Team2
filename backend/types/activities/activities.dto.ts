import { ActivityActions } from "../../generated/prisma/enums.js";

export interface ActivityResponseDto {
    id: string;
    user_id: string;
    target_user_id: string | null;
    review_id: string | null;
    media_id: string | null;
    rating_from_user?: number | null;
    action: ActivityActions
    created_at: Date;
}

export interface ActivityAddDto {
    user_id: string;
    action: ActivityActions;
    target_user_id?: string | null;
    review_id?: string | null;
    media_id?: string | null;
    rating_from_user?: number | null;
}

export interface FeedItem {
    type: 'review' | 'like' | 'comment' | 'new_album' | 'recommendation';
    user_id?: string;
    review_id?: string;
    media_id?: string;
    artist?: string;
    album?: string;
    cover?: string
    created_at: Date;
    content?: string;
}

export interface ActivityDeleteResponseDto {
    id: string;
    user_id: string;
}

export interface ActivityWithRelationsDto {
    id: string;
    user_id: string;
    target_user_id: string | null;
    review_id: string | null;
    media_id: string | null;
    rating_from_user: number | null;
    action: ActivityActions;
    created_at: Date;
    review: {
        content: string;
    } | null;
    media: {
        content: unknown;
    } | null;
}

export interface FollowIdDto {
    follow_user_id: string;
}

