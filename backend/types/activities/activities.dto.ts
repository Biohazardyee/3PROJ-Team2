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

export interface ActivityUserFeedResponseDto {
    id: string;
    user_id: string;
    user: {
        id: string;
        username: string;
    };

    target_user_id?: string | null;
    target_user?: {
        id: string;
        username: string;
    } | null;

    review_id?: string | null;
    review?: {
        id: string;
        rating: number;
    } | null;

    media_id?: string | null;
    media?: {
        id: string;
        api_id: string;
    } | null;

    action: ActivityActions;
    rating_from_user?: number | null;
    created_at: Date;
}

export interface ActivityDeleteResponseDto {
    id: string;
    user_id: string;
}