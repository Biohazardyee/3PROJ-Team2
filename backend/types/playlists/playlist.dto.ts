// Responses interfaces
export interface PlaylistResponseDto {
    id: string;
    user_id: string;
    name: string;
    image_url?: string;
    is_public: boolean;
    items?: {
        id: string;
        media_id: string;
        rating: number; // On le met obligatoire (number) pour forcer l'affectation
        media?: {
            id: string;
            title: string;
            cover: string;
        };
    }[];
    created_at: Date;
    updated_at: Date;
}

export interface PlaylistResponseAddDto {
    id: string;
    user_id: string;
    name: string;
    image_url?: string;
    created_at: Date;
}

export interface PlaylistResponseUpdateDto {
    id: string;
    name: string;
    is_public: boolean;
    image_url?: string;
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
    image_url?: string;
    spotify_playlist_id?: string;
}

export interface PlaylistUpdateDto {
    name?: string;
    is_public?: boolean;
    image_url?: string;
}
