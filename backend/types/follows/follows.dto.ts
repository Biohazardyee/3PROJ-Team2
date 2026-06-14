export interface FollowResponseDto {
    user_id: string;
    follow_user_id: string;
    created_at: Date;
}

export interface FollowCreateDto{
    user_id: string;
    follow_user_id: string;
}

