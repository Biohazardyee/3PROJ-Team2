import {PrismaDb} from '../../../config/database.js';
import {Reports, ReportTypes} from '../../../generated/prisma/browser.js';
import {BadRequest, NotFound} from '../../../utils/errors.js';
import {isEmptyString} from '../../../utils/helpers.js';
import {
    ReportAddDto, ReportDeleteResponseDto,
    ReportResponseAddDto,
    ReportResponseDto
} from "../../../types/reports/report.dto.js";
import {User, Reviews, Prisma, ReviewComments} from "../../../generated/prisma/browser.js";
import {reportMapper} from "../../../mappers/reports/report.mapper.js";


export class ReportService {

    async create(data: ReportAddDto): Promise<ReportResponseAddDto> {

        if (isEmptyString(data.reporter_id)) {
            throw new BadRequest('Reporter_id is required');
        }

        if (isEmptyString(data.reason)) {
            throw new BadRequest('Reason cannot be empty');
        }

        if (!data.reason_type || !Object.values(ReportTypes).includes(data.reason_type)) {
            throw new BadRequest('Invalid report type');
        }

        const reporter: User | null = await PrismaDb.user.findUnique({
            where: {
                id: data.reporter_id
            }
        });

        if (!reporter) {
            throw new BadRequest('Reporter not found');
        }

        const createData: Prisma.ReportsUncheckedCreateInput = {
            reporter_id: data.reporter_id,
            profile_id: data.profile_id,
            reason: data.reason,
            reason_type: data.reason_type,
        }

        if (createData.reason_type === ReportTypes.review) {

            if (!data.review_id) {
                throw new BadRequest('Review_id is required for review reports');
            }

            const review: Reviews | null = await PrismaDb.reviews.findUnique({
                where: {
                    id: data.review_id
                }
            });

            if (!review) {
                throw new BadRequest('Review not found');
            }

            createData.review_id = data.review_id;
        }

        if (createData.reason_type === ReportTypes.profile) {

            if (!data.profile_id) {
                throw new BadRequest('Profile_id is required for profile reports');
            }

            const user: User | null = await PrismaDb.user.findUnique({
                where: {
                    id: data.profile_id
                }
            });

            if (!user) {
                throw new BadRequest('Profile not found');
            }

            createData.profile_id = data.profile_id;
        }

        if (createData.reason_type === ReportTypes.comment) {

            if (!data.comment_id) {
                throw new BadRequest('Comment_id is required for profile reports');
            }

            const comment: ReviewComments | null = await PrismaDb.reviewComments.findUnique({
                where: {
                    id: data.comment_id
                }
            });

            if (!comment) {
                throw new BadRequest('Comment not found');
            }

            createData.comment_id = data.comment_id;
        }

        const report: Reports = await PrismaDb.reports.create({
            data: createData,
        })

        return reportMapper.toAddDto(report)

    }

    async getAll(): Promise<ReportResponseDto[]> {
        const reports: Reports[] = await PrismaDb.reports.findMany({
            orderBy: {
                created_at: 'asc'
            }
        });

        return reportMapper.toDtoList(reports)
    }

    async getById(id: string): Promise<ReportResponseDto> {

        if (isEmptyString(id)) {
            throw new BadRequest('Report id is required');
        }

        const report: Reports | null = await PrismaDb.reports.findUnique({
            where: {
                id
            },
        });

        if (!report) throw new NotFound('Report not found');

        return reportMapper.toDto(report)
    }

    async getByReview(review_id: string): Promise<ReportResponseDto[]> {

        if (isEmptyString(review_id)) {
            throw new BadRequest('review_id is required');
        }

        const review: Reviews | null = await PrismaDb.reviews.findUnique({
            where: {
                id: review_id
            }
        });

        if (!review) {
            throw new NotFound('Review not found');
        }

        const reports: Reports[] = await PrismaDb.reports.findMany({
            where: {
                review_id
            },
            orderBy: {
                created_at: 'desc'
            }
        });

        return reportMapper.toDtoList(reports);
    }

    async update(): Promise<void> {
        // no implementation needed.
    }

    async delete(id: string): Promise<ReportDeleteResponseDto> {

        if (isEmptyString(id)) {
            throw new BadRequest('Report id is required');
        }

        const report: Reports | null = await PrismaDb.reports.findUnique({
            where: {
                id
            }
        });

        if (!report) {
            throw new NotFound('Report not found');
        }

        const reportToDelete: Reports = await PrismaDb.reports.delete({
            where: {
                id
            }
        })

        return reportMapper.toDto(reportToDelete);
    }
}

export const reportService = new ReportService();