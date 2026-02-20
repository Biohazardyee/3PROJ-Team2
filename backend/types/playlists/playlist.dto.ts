// Responses interfaces
export interface PlaylistResponseDto {
    id: string;
    user_id: string;
    name: string;
    created_at: Date;
    updated_at: Date;
}

export interface PlaylistResponseAddDto {
    id: string;
    user_id: string;
    name: string;
    created_at: Date;
}

export interface PlaylistResponseUpdateDto {
    id: string;
    name: string;
    is_public: boolean;
    updated_at: Date;
}

export interface PlaylistResponseDeleteDto {
    id: string;
    user_id: string;
    name: string;
}

// Post interfaces
export interface PlaylistAddDto {
    user_id: string;
    name: string;
    is_public: boolean;
}

export interface PlaylistUpdateDto {
    name?: string;
    is_public?: boolean;
}
