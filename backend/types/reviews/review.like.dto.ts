// Response Interfaces
export interface ReviewLikeResponseDto {
    user_id : string;
    review_id : string;
    created_at: Date;
}

// Post Interfaces
export interface ReviewLikeAddDto {
    user_id: string;
    review_id : string;
}