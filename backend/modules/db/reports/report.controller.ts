import type {Request, Response, NextFunction} from 'express';
import {reportService} from './report.service.js';
import {BadRequest} from '../../../utils/errors.js';

class ReportController {

    constructor(private readonly service = reportService) {
    }

    async add(req: Request, res: Response, next: NextFunction) {
        try {
            const {
                reporter_id, 
                review_id, 
                reason, 
                reason_type
            } = req.body;

            if (!reporter_id || !reason || !reason_type) {
                throw new BadRequest('reporter_id, reason and reason_type are required');
            }

            const report = await this.service.create({
                reporter_id, 
                review_id, 
                reason, 
                reason_type
            });

            res.status(201).json({message: 'Report created successfully', report});
        } catch (error) {
            next(error);
        }
    }

    async getAll(_: Request, res: Response, next: NextFunction) {
        try {
            const reports = await this.service.getAll();
            res.status(200).json({message: 'Reports retrieved successfully', reports});
        } catch (error) {
            next(error);
        }
    }

    async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const {
                id
            } = req.params;

            if (!id) {
                throw new BadRequest('Report id is required');
            }

            const report = await this.service.getById(id);
            res.status(200).json({message: 'Report retrieved successfully', report});
        } catch (error) {
            next(error);
        }
    }

    async getByReview(req: Request, res: Response, next: NextFunction) {
        try {
            const {
                review_id
            } = req.params;

            if (!review_id) {
                throw new BadRequest('review_id is required');
            }

            const reports = await this.service.getByReview(review_id);
            res.status(200).json({message: 'Reports retrieved successfully', reports});
        } catch (error) {
            next(error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const {
                id
            } = req.params;

            if (!id) {
                throw new BadRequest('Report id is required');
            }

            const report = await this.service.update(id);
            res.status(200).json({message: 'Report marked as checked', report});
        } catch (error) {
            next(error);
        }
    }

    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const {
                id
            } = req.params;
            
            if (!id) {
                throw new BadRequest('Report id is required');
            }

            const report = await this.service.delete(id);
            res.status(200).json({message: 'Report deleted', report});
        } catch (error) {
            next(error);
        }
    }
}

export default new ReportController();
