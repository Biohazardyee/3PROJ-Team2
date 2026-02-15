// Reponse Interface
export interface PlaylistItemResponseDto {
    id: string;
    playlist_id: string;
    media_id: string;
    created_at: Date;
}

// Create Interface
export interface PlaylistItemCreateDto {
    playlist_id: string;
    media_id: string;
}