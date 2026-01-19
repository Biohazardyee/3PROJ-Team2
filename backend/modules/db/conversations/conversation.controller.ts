// import type {Request, Response, NextFunction} from 'express';
//
// import {Controller} from '../../controller.js';
// import {BadRequest} from '../../../utils/errors.js';
// import {conversationService} from './conversation.service.js';
//
// class ConversationController extends Controller {
//
//     constructor(private readonly service = conversationService) {
//         super();
//     }
//
//     async add(req: Request, res: Response, next: NextFunction) {
//         try {
//             const {
//                 user1_id,
//                 user2_id,
//             } = req.body;
//
//             if (!user1_id) {
//                 throw new BadRequest('User_id1 is required');
//             }
//
//             if (!user2_id) {
//                 throw new BadRequest('User_id2 is required');
//             }
//
//             const reviewComment = await this.service.create({
//                 user1_id,
//                 user2_id,
//                 created_at: new Date(),
//             });
//
//             res.status(201).json({
//                 message: 'Conervsation created successfully',
//                 reviewComment,
//             });
//         } catch (err) {
//             next(err);
//         }
//     }
//
//     async getAll(_: Request, res: Response, next: NextFunction) {
//         try {
//             const conversations = await this.service.getAll();
//             res.status(201).json({
//                 message: 'All conversations retrieved successfully',
//                 conversations,
//             });
//         } catch (err) {
//             next(err);
//         }
//     }
//
//     async getById(req: Request, res: Response, next: NextFunction) {
//         try {
//             const {
//                 id
//             } = req.params;
//
//             if (!id) {
//                 throw new BadRequest('ID is required');
//             }
//
//             const conversation = await this.service.getById(id);
//
//             res.status(201).json({
//                 message: `Conversation retrieved successfully`,
//                 conversation,
//             });
//         } catch (err) {
//             next(err);
//         }
//     }
//
//     async update(req: Request, res: Response, next: NextFunction) {
//         // This function don't have to be used for this table
//         return null
//     }
//
//     async delete(req: Request, res: Response, next: NextFunction) {
//         try {
//             const {
//                 id
//             } = req.params;
//
//             if (!id) {
//                 throw new BadRequest('ID is required');
//             }
//
//             const conversation = await this.service.delete(id);
//             res.json({
//                 message: 'Conversation deleted successfully',
//                 conversation,
//             });
//         } catch (err) {
//             next(err);
//         }
//     }
// }
//
// export default new ConversationController();