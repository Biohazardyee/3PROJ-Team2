// Response Interface
export interface BannedUserResponseDto {
    id: string;
    user_id: string;
    content: string;
    created_at: Date;
}

// Post Interface
export interface BannedUserAddDto {
    id: string;
    user_id: string;
    content: string;
}

export interface BannedUserUpdateDto {
    content?: string;
}

export interface BannedUserDeleteDto {
    id: string;
    user_id: string;
}