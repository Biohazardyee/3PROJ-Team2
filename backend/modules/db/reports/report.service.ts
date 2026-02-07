import {PrismaDb} from '../../../config/database.js';
import {ReportTypes} from '../../../generated/prisma/browser.js';
import {BadRequest, NotFound} from '../../../utils/errors.js';
import {isEmptyString} from '../../../utils/helpers.js';

export class ReportService {

    async create(data: {
        reporter_id: string;
        review_id?: string;
        reason: string;
        reason_type: ReportTypes;
    }) {
        const {
            reporter_id,
            review_id,
            reason,
            reason_type
        } = data;


        if (isEmptyString(reporter_id)) {
            throw new BadRequest('reporter_id is required');
        }

        if (isEmptyString(reason)) {
            throw new BadRequest('reason cannot be empty');
        }

        if (!reason_type || !Object.values(ReportTypes).includes(reason_type)) {
            throw new BadRequest('Invalid report type');
        }

        const reporter = await PrismaDb.user.findUnique({
            where: {
                id: reporter_id
            }
        });

        if (!reporter) {
            throw new BadRequest('Reporter not found');
        }

        if (reason_type === ReportTypes.review) {

            if (!review_id) {
                throw new BadRequest('review_id is required for review reports');
            }

            const review = await PrismaDb.reviews.findUnique({where: {id: review_id}});

            if (!review) {
                throw new BadRequest('Review not found');
            }
        }

        return PrismaDb.reports.create({
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
        return PrismaDb.reports.findMany({
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
            orderBy: {
                created_at: 'desc'
            },
        });
    }

    async getById(id: string) {
        if (isEmptyString(id)) {
            throw new BadRequest('Report id is required');
        }

        const report = await PrismaDb.reports.findUnique({
            where: {
                id
            },
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
        });

        if (!report) throw new NotFound('Report not found');
        return report;
    }

    async getByReview(review_id: string) {

        if (isEmptyString(review_id)) {
            throw new BadRequest('review_id is required');
        }

        const review = await PrismaDb.reviews.findUnique({
            where: {
                id: review_id
            }
        });

        if (!review) {
            throw new NotFound('Review not found');
        }

        return PrismaDb.reports.findMany({
            where: {
                review_id
            },
            include: {
                reporter: {
                    select: {
                        id: true,
                        username: true
                    }
                },
            },
            orderBy: {
                created_at: 'desc'
            },
        });
    }

    async update(id: string) {

        if (isEmptyString(id)) {
            throw new BadRequest('Report id is required');
        }

        const report = await PrismaDb.reports.findUnique({
            where: {
                id
            }
        });

        if (!report) {
            throw new NotFound('Report not found');
        }

        return PrismaDb.reports.update({
            where: {
                id
            },
            data: {
                is_checked: true
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

    async delete(id: string) {

        if (isEmptyString(id)) {
            throw new BadRequest('Report id is required');
        }

        const report = await PrismaDb.reports.findUnique({
            where: {
                id
            }
        });

        if (!report) {
            throw new NotFound('Report not found');
        }

        return PrismaDb.reports.delete({
            where: {
                id
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
}

export const reportService = new ReportService();