// model ReviewLikes {
//     user       User     @relation(fields: [user_id], references: [id])
//     user_id    String
//     review     Reviews  @relation(fields: [review_id], references: [id])
//     review_id  String
//     created_at DateTime @default(now())
//
// @@id([user_id, review_id])
// }

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