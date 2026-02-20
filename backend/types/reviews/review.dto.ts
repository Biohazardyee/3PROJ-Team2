// Response interface
export interface ReviewResponseDto {
    id: string;
    user_id: string;
    media_id: string;
    rating: number;
    content: string
    created_at: Date;
    updated_at: Date
}

export interface ReviewResponseAddDto {
    id: string;
    user_id: string;
    media_id: string;
    rating: number;
    content: string
    created_at: Date;
}

export interface ReviewResponseDeleteDto {
    id: string;
    user_id: string;
    media_id: string;
}

// Post interface
export interface ReviewAddDto {
    user_id: string;
    media_id: string;
    rating: number;
    content: string;
}

export interface ReviewUpdateDto{
    rating?: number;
    content?: string;
}