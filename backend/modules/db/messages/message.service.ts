// import {prisma} from '../../../config/database.js';
// import {BadRequest, NotFound} from '../../../utils/errors.js';
// import {isEmptyString} from '../../../utils/helpers.js';
//
// export class MessageService {
//
//     async create(data: {
//         conversationId: string,
//         senderId: string,
//         content: string,
//         is_read: boolean,
//     }) {
//         const {
//             conversationId,
//             senderId,
//             content,
//             is_read,
//         } = data;
//
//
//         if (isEmptyString(conversationId)) {
//             throw new BadRequest('ConversationID cannot be empty');
//         }
//
//         if (isEmptyString(senderId)) {
//             throw new BadRequest('SenderID cannot be empty');
//         }
//
//         if (isEmptyString(content)) {
//             throw new BadRequest('Conversation content cannot be empty');
//         }
//
//
//         const conversation = await prisma.conversation.findUnique({
//             where: {
//                 id: conversationId
//             }
//         });
//
//         if (!reporter) {
//             throw new BadRequest('Reporter not found');
//         }
//
//
//         if (reason_type === ReportType.review) {
//
//             if (!review_id) {
//                 throw new BadRequest('review_id is required for review reports');
//             }
//
//             const review = await prisma.review.findUnique({where: {id: review_id}});
//
//             if (!review) {
//                 throw new BadRequest('Review not found');
//             }
//         }
//
//         return prisma.report.create({
//             data: {
//                 reporter_id,
//                 review_id,
//                 reason,
//                 reason_type
//             },
//             include: {
//                 reporter: {
//                     select: {
//                         id: true,
//                         username: true
//                     }
//                 },
//                 review: {
//                     select: {
//                         id: true,
//                         rating: true
//                     }
//                 },
//             },
//         });
//     }
//
//     async getAll() {
//         return prisma.report.findMany({
//             include: {
//                 reporter: {
//                     select: {
//                         id: true,
//                         username: true,
//                         email: true
//                     }
//                 },
//                 review: {
//                     select: {
//                         id: true,
//                         rating: true
//                     }
//                 },
//             },
//             orderBy: {created_at: 'desc'},
//         });
//     }
//
//     async getById(id: string) {
//         if (isEmptyString(id)) {
//             throw new BadRequest('Report id is required');
//         }
//
//         const report = await prisma.report.findUnique({
//             where: {id},
//             include: {
//                 reporter: {
//                     select:
//                         {
//                             id: true,
//                             username: true,
//                             email: true
//                         }
//                 },
//                 review: {
//                     select: {
//                         id: true,
//                         rating: true
//                     }
//                 },
//             },
//         });
//
//         if (!report) throw new NotFound('Report not found');
//         return report;
//     }
//
//     async getByReview(review_id: string) {
//         if (isEmptyString(review_id)) {
//             throw new BadRequest('review_id is required');
//         }
//
//         const review = await prisma.review.findUnique({where: {id: review_id}});
//
//         if (!review) {
//             throw new NotFound('Review not found');
//         }
//
//         return prisma.report.findMany({
//             where: {review_id},
//             include: {
//                 reporter: {
//                     select: {
//                         id: true,
//                         username: true
//                     }
//                 },
//             },
//             orderBy: {created_at: 'desc'},
//         });
//     }
//
//     async update(id: string) {
//
//         if (isEmptyString(id)) {
//             throw new BadRequest('Report id is required');
//         }
//
//         const report = await prisma.report.findUnique({where: {id}});
//         if (!report) {
//             throw new NotFound('Report not found');
//         }
//
//         return prisma.report.update({
//             where: {id},
//             data: {is_checked: true},
//             include: {
//                 reporter: {
//                     select: {
//                         id: true,
//                         username: true
//                     }
//                 },
//                 review: {
//                     select: {
//                         id: true,
//                         rating: true
//                     }
//                 },
//             },
//         });
//     }
//
//     async delete(id: string) {
//
//         if (isEmptyString(id)) {
//             throw new BadRequest('Report id is required');
//         }
//
//         const report = await prisma.report.findUnique({where: {id}});
//         if (!report) {
//             throw new NotFound('Report not found');
//         }
//
//         return prisma.report.delete({
//             where: {id},
//             include: {
//                 reporter: {
//                     select: {
//                         id: true,
//                         username: true
//                     }
//                 },
//                 review: {
//                     select: {
//                         id: true,
//                         rating: true
//                     }
//                 },
//             },
//         });
//     }
// }
//
//
// export const messageService = new MessageService();
