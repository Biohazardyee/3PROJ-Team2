// import {prisma} from '../../../config/database.js';
// import {NotFound, BadRequest} from '../../../utils/errors.js';
// import {isValidStringLength, isEmptyString} from "../../../utils/helpers.js";
//
// export class ConversationService {
//
//     async create(data: {
//         user1_id: string,
//         user2_id: string,
//         created_at: Date,
//     }) {
//
//         if (isEmptyString(data.user1_id)) {
//             throw new BadRequest("User1_id cannot be empty");
//         }
//
//         if (isEmptyString(data.user2_id)) {
//             throw new BadRequest("User2_id cannot be empty");
//         }
//
//         const user = await prisma.conversation.findUnique({
//             where: {
//                 user1_id: data.user1_id,
//             }
//         })
//
//         if (!user) {
//             throw new BadRequest("The user doesn't exist");
//         }
//
//         const review = await prisma.review.findUnique({
//             where: {
//                 id: data.review_id,
//             }
//         })
//
//         if (!review) {
//             throw new BadRequest('The review doesn\'t exist');
//         }
//
//         return prisma.reviewComment.create({
//             data,
//             select: {
//                 user_id: true,
//                 review_id: true,
//                 content: true,
//                 created_at: true,
//             },
//         });
//     }
//
//     async getAll() {
//         return prisma.reviewComment.findMany({
//             select: {
//                 user_id: true,
//                 review_id: true,
//                 content: true,
//                 created_at: true,
//             }
//         });
//     }
//
//     async getById(id: string) {
//
//         if (isEmptyString(id)) {
//             throw new BadRequest("ID cannot be empty");
//         }
//
//         const reviewComment = await prisma.reviewComment.findUnique({
//             where: {
//                 id: id,
//             },
//             select: {
//                 user_id: true,
//                 review_id: true,
//                 content: true,
//                 created_at: true
//             }
//         });
//
//         if (!reviewComment) {
//             throw new NotFound('Comment not found');
//         }
//
//         return reviewComment;
//     }
//
//     async update(id: string, data: { content?: string }) {
//
//         if (isEmptyString(id)) {
//             throw new BadRequest("ID cannot be empty");
//         }
//
//         const reviewComment = await prisma.reviewComment.findUnique({
//             where: {
//                 id: id,
//             }
//         })
//
//         if (!reviewComment) {
//             throw new NotFound('Comment does not exist');
//         }
//
//         const allowedFields = [
//             'content'
//         ];
//
//         for (const key of Object.keys(data)) {
//             if (!allowedFields.includes(key)) {
//                 throw new BadRequest(`Field "${key}" cannot be updated`);
//             }
//         }
//
//         if (data.content) {
//             if (isEmptyString(data.content)) {
//                 throw new BadRequest('Content cannot be empty');
//             }
//             if (!isValidStringLength(data.content, 1000)) {
//                 throw new BadRequest('Content cannot be much than 1000 characters');
//             }
//         }
//
//         return prisma.reviewComment.update({
//             where: {
//                 id
//             },
//             data,
//             select: {
//                 user_id: true,
//                 review_id: true,
//                 content: true,
//                 created_at: true,
//             }
//         });
//     }
//
//     async delete(id: string) {
//
//         if (isEmptyString(id)) {
//             throw new BadRequest("ID cannot be empty");
//         }
//
//         return prisma.reviewComment.delete({
//             where: {
//                 id: id,
//             },
//             select: {
//                 user_id: true,
//                 review_id: true,
//                 content: true,
//                 created_at: true
//             },
//         });
//     }
// }
//
// export const reviewCommentService = new ConversationService();