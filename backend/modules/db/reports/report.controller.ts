import type {Request, Response, NextFunction} from 'express';
import {ReportService, reportService} from './report.service.js';
import {BadRequest} from '../../../utils/errors.js';
import {Controller} from "../../controller.js";
import {
    ReportAddDto, ReportDeleteResponseDto,
    ReportResponseAddDto,
    ReportResponseDto, ReportUpdateDto,
} from "../../../types/reports/report.dto.js";

class ReportController extends Controller {

    constructor(private readonly service: ReportService = reportService) {
        super();
    }

    async add(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const createData: ReportAddDto = {
                reporter_id: req.body.reporter_id,
                review_id: req.body.review_id,
                profile_id: req.body.profile_id,
                comment_id: req.body.comment_id,
                reason: req.body.reason,
                reason_type: req.body.reason_type,
            };

            if (!createData.reporter_id || !createData.reason || !createData.reason_type) {
                throw new BadRequest('Reporter_id, Reason and Reason_type are required');
            }

            const report: ReportResponseAddDto = await this.service.create(createData);

            res.status(201).json({
                message: 'Report created successfully',
                report
            });
        } catch (error) {
            next(error);
        }
    }

    async getAll(_: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const reports: ReportResponseDto[] = await this.service.getAll();
            res.status(201).json({
                message: 'Reports retrieved successfully',
                reports
            });
        } catch (error) {
            next(error);
        }
    }

    async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.params.id) {
                throw new BadRequest('Report id is required');
            }

            const report: ReportResponseDto = await this.service.getById(req.params.id);
            res.status(200).json({
                message: 'Report retrieved successfully',
                report
            });
        } catch (error) {
            next(error);
        }
    }

    async getByReview(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.params.review_id) {
                throw new BadRequest('review_id is required');
            }

            const reports: ReportResponseDto[] = await this.service.getByReview(req.params.review_id);

            res.status(200).json({
                message: 'Reports retrieved successfully',
                reports
            });
        } catch (error) {
            next(error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id: string = req.params.id;

            if (!id) {
                throw new BadRequest('Id is required');
            }

            const updateData: ReportUpdateDto = {};

            if (req.body.reason !== undefined) {
                updateData.reason = req.body.reason;
            }

            if (req.body.is_checked !== undefined) {
                updateData.is_checked = req.body.is_checked;
            }

            if (Object.keys(updateData).length === 0) {
                throw new BadRequest('No fields provided');
            }

            const report: ReportResponseDto = await this.service.update(id, updateData);

            res.status(200).json({
                message: 'Report updated successfully',
                report,
            });
        } catch (err) {
            next(err);
        }
    }

    async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {

            if (!req.params.id) {
                throw new BadRequest('Report id is required');
            }

            const report: ReportDeleteResponseDto = await this.service.delete(req.params.id);
            res.status(201).json({
                message: 'Report deleted',
                report
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new ReportController();
