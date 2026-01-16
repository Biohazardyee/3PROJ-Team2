import { prisma } from '../../config/database.js';
import { ReportType } from '../../generated/prisma/browser.js';
import { BadRequest, NotFound } from '../../utils/errors.js';
import { isEmptyString } from '../../utils/helpers.js';

export class ReportService {

    async create(data: {
        reporter_id: string;
        review_id?: string;
        reason: string;
        reason_type: ReportType;
    }) {
        const {
            reporter_id,
            review_id,
            reason,
            reason_type
        } = data;


        if (isEmptyString(reporter_id)) throw new BadRequest('reporter_id is required');

        if (isEmptyString(reason)) throw new BadRequest('reason cannot be empty');

        if (!reason_type || !Object.values(ReportType).includes(reason_type)) {
            throw new BadRequest('Invalid report type');
        }


        const reporter = await prisma.user.findUnique({ where: { id: reporter_id } });

        if (!reporter) throw new BadRequest('Reporter not found');


        if (reason_type === ReportType.review) {

            if (!review_id) throw new BadRequest('review_id is required for review reports');

            const review = await prisma.review.findUnique({ where: { id: review_id } });

            if (!review) throw new BadRequest('Review not found');
        }

        return prisma.report.create({
            data: {
                reporter_id,
                review_id,
                reason,
                reason_type
            },
            include: {
                reporter: {
                    select: {
                        id: true,
                        username: true
                    }
                },
                review: {
                    select: {
                        id: true,
                        rating: true
                    }
                },
            },
        });
    }

    async getAll() {
        return prisma.report.findMany({
            include: {
                reporter: {
                    select: {
                        id: true,
                        username: true,
                        email: true
                    }
                },
                review: {
                    select: {
                        id: true,
                        rating: true
                    }
                },
            },
            orderBy: { created_at: 'desc' },
        });
    }

    async getById(id: string) {
        if (isEmptyString(id)) throw new BadRequest('Report id is required');

        const report = await prisma.report.findUnique({
            where: { id },
            include: {
                reporter: {
                    select:
                    {
                        id: true,
                        username: true,
                        email: true
                    }
                },
                review: {
                    select: {
                        id: true,
                        rating: true
                    }
                },
            },
        });

        if (!report) throw new NotFound('Report not found');
        return report;
    }

    async getByReview(review_id: string) {
        if (isEmptyString(review_id)) throw new BadRequest('review_id is required');

        const review = await prisma.review.findUnique({ where: { id: review_id } });
        if (!review) throw new NotFound('Review not found');

        return prisma.report.findMany({
            where: { review_id },
            include: {
                reporter: {
                    select: {
                        id: true,
                        username: true
                    }
                },
            },
            orderBy: { created_at: 'desc' },
        });
    }

    async update(id: string) {
        if (isEmptyString(id)) throw new BadRequest('Report id is required');

        const report = await prisma.report.findUnique({ where: { id } });
        if (!report) throw new NotFound('Report not found');

        return prisma.report.update({
            where: { id },
            data: { is_checked: true },
            include: {
                reporter: {
                    select: {
                        id: true,
                        username: true
                    }
                },
                review: {
                    select: {
                        id: true,
                        rating: true
                    }
                },
            },
        });
    }

    async delete(id: string) {
        if (isEmptyString(id)) throw new BadRequest('Report id is required');

        const report = await prisma.report.findUnique({ where: { id } });
        if (!report) throw new NotFound('Report not found');

        return prisma.report.delete({
            where: { id },
            include: {
                reporter: {
                    select: {
                        id: true,
                        username: true
                    }
                },
                review: {
                    select: {
                        id: true,
                        rating: true
                    }
                },
            },
        });
    }
}


export const reportService = new ReportService();
