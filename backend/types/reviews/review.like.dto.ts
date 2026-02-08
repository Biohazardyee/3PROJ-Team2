// model ReviewLikes {
//     user       User     @relation(fields: [user_id], references: [id])
//     user_id    String
//     review     Reviews  @relation(fields: [review_id], references: [id])
//     review_id  String
//     created_at DateTime @default(now())
//
// @@id([user_id, review_id])
// }


export interface ReviewLikeResponseDto {
    user_id : string;
    review_id : string;
    created_at: Date;
}

export interface ReviewLikeAddResponseDto {
    id: string;
    user_id: string;
    review_id : string;
    created_at: Date;
}