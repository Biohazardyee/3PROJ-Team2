export interface FollowResponseDto {
    user_id: string;
    follow_user_id: string;
    created_at: Date;
}

export interface FollowCreateDto{
    user_id: string;
    follow_user_id: string;
}

export interface FollowUserPreviewDto {
    id: string;
    username: string;
    pseudo: string;
    profile_picture: string | null;
    equipped_avatar_border: string | null;
    equipped_font: string | null;
    equipped_text_effect: string | null;
}

