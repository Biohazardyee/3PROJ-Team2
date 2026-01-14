import type { Request, Response, NextFunction } from 'express';
import { Controller } from '../controller.js';
import { reportService } from './report.service.js';
import { BadRequest, NotFound } from '../../utils/errors.js';

class ReportController extends Controller {

    constructor(private readonly service = reportService) {
        super();
    }

    async add(req: Request, res: Response, next: NextFunction) {
        try {
            const { reporter_id, review_id, reason, reason_type } = req.body;

            if (!reporter_id || !reason || !reason_type) {
                throw new BadRequest("Reporter id, reason and reason type are required");
            }

            const report = await this.service.create({
                reporter_id,
                review_id,
                reason,
                reason_type
            });

            res.status(201).json({
                message: "Report created successfully",
                report
            });

        } catch (error) {
            next(error);
        }
    }


    async getAll(_: Request, res: Response, next: NextFunction) {
        try {
            const reports = await this.service.getAll();
            res.status(200).json(reports);
        } catch (error) {
            next(error);
        }
    }


    async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const report = await this.service.getById(req.params.id);
            if (!report) throw new NotFound("Report not found");
            res.status(200).json(report);
        } catch (error) {
            next(error);
        }
    }


    async getByReview(req: Request, res: Response, next: NextFunction) {
        try {
            const reports = await this.service.getByReview(req.params.review_id);
            res.status(200).json(reports);
        } catch (error) {
            next(error);
        }
    }


    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const updated = await this.service.update(req.params.id);
            res.status(200).json({
                message: "Report marked as checked",
                report: updated
            });
        } catch (error) {
            next(error);
        }
    }


    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const deleted = await this.service.delete(req.params.id);
            res.status(200).json({
                message: "Report deleted",
                report: deleted
            });
        } catch (error) {
            next(error);
        }
    }

}

export default new ReportController();
