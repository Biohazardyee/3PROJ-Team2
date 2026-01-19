// import type {Request, Response, NextFunction} from 'express';
//
// import {Controller} from '../../controller.js';
// import {BadRequest} from '../../../utils/errors.js';
// import {messageService} from './message.service.js';
//
// class MessageController extends Controller {
//
//     constructor(private readonly service = messageService) {
//         super();
//     }
//
//     async add(req: Request, res: Response, next: NextFunction) {
//         try {
//             const {
//
//             } = req.body;
//
//
//
//             const message = await this.service.create({
//
//                 created_at: new Date(),
//             });
//
//             res.status(201).json({
//                 message: 'Comment created successfully',
//                 message,
//             });
//         } catch (err) {
//             next(err);
//         }
//     }
//
//     async getAll(_: Request, res: Response, next: NextFunction) {
//         try {
//             const messages = await this.service.getAll();
//             res.status(201).json({
//                 message: 'All comments retrieved successfully',
//                 messages,
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
//             const messages = await this.service.getById(id);
//
//             res.status(201).json({
//                 message: `Comment retrieved successfully`,
//                 messages,
//             });
//         } catch (err) {
//             next(err);
//         }
//     }
//
//     async update(req: Request, res: Response, next: NextFunction) {
//         try {
//             const id = req.params.id;
//
//             if (!id) {
//                 throw new BadRequest('ID is required');
//             }
//
//             const {
//
//             } = req.body;
//
//             let data: any = {}
//
//
//
//             if (Object.keys(data).length === 0) {
//                 throw new BadRequest("No fields provided")
//             }
//
//             const messages = this.service.update(id, data)
//
//             res.status(201).json({
//                 message: `Comment updated successfully`,
//                 messages,
//             });
//         } catch (err) {
//             next(err);
//         }
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
//             const message = await this.service.delete(id);
//             res.json({
//                 message: 'Comment deleted successfully',
//                 message,
//             });
//         } catch (err) {
//             next(err);
//         }
//     }
// }
//
// export default new messageController();