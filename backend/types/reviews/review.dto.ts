// Response interface
export interface ReviewResponseDto {
    id: string;
    user_id: string;
    media_id: string;
    rating: number;
    title: string;
    content: string;
    created_at: Date;
    updated_at: Date;
    likes_count: number;
    comments_count: number;
    isLiked: boolean;
    user?: {
        username: string;
    };
    media?: {
        id: string;
        content: any;
    };
}
export interface ReviewResponseAddDto {
    id: string;
    user_id: string;
    media_id: string;
    rating: number;
    title: string;
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
    title: string;
    content: string;
}

export interface ReviewUpdateDto {
    rating?: number;
    title?: string;
    content?: string;
}

export interface ReviewWithMediaDto {
    id: string;
    user_id: string;
    media_id: string;
    rating: number;
    title: string;
    content: string;
    created_at: Date;
    user: {
        id: string;
        username: string;
    } | null;
    media: {
        id: string; 
        content: any;
    } | null;
    likes?: any[];
    likes_count?: number; 
    _count?: {
        comments: number;
        likes?: number;
    };
}