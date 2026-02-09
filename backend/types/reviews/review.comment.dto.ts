// model ReviewComments {
//     id         String    @id @default(uuid())
//     review     Reviews   @relation(fields: [review_id], references: [id])
//     review_id  String
//     user       User      @relation(fields: [user_id], references: [id])
//     user_id    String
//     content    String    @db.VarChar(1000)
//     created_at DateTime  @default(now())
//     reports    Reports[]
// }


// Responses interfaces
export interface ReviewCommentResponseDto {
    id: string;
    review_id: string;
    user_id: string;
    content: string;
    created_at: Date;
}

// Post interfaces
export interface ReviewCommentAddDto {
    review_id: string;
    user_id: string;
    content: string;
}

export interface ReviewCommentUpdateDto {
    content?: string;
}