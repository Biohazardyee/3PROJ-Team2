// Responses interfaces
export interface ReviewCommentResponseDto {
    id: string;
    review_id: string;
    user_id: string;
    content: string;
    created_at: Date;
    parent_id: string | null;
    likes_count?: number;
    isLiked?: boolean;
    user?: {
        id: string;
        username: string;
    };
}

// Post interfaces
export interface ReviewCommentAddDto {
    review_id: string;
    parent_id: string | null;
    user_id: string;
    content: string;
}

export interface ReviewCommentUpdateDto {
    content?: string;
}