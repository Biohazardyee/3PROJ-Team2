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
        pseudo?: string | null;
        image?: string | null;
        equipped_avatar_border?: string | null;
        equipped_font?: string | null;
        equipped_text_effect?: string | null;
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