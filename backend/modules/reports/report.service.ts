import { prisma } from '../../config/database.js';
import { ReportType } from '../../generated/prisma/browser.js';
import { BadRequest, NotFound } from '../../utils/errors.js';
import { isEmptyString } from '../../utils/helpers.js';



export class ReportService {

    async create(data: any) {

        const { reporter_id, review_id, reason, reason_type } = data;

        if (!reporter_id) {
            throw new BadRequest("Missing reporter_id field");
        }

        if (isEmptyString(reason)) {
            throw new BadRequest("Reason cannot be empty");
        }

        if (!reason_type) {
            throw new BadRequest("Missing reason_type field");
        }


        if (!Object.values(ReportType).includes(reason_type)) {
            throw new BadRequest("Invalid report type");
        }


        const reporter = await prisma.user.findUnique({ where: { id: reporter_id } });
        if (!reporter) throw new BadRequest("Reporter not found");


        if (reason_type === ReportType.review) {
            if (!review_id) throw new BadRequest("review_id required for review reports");

            const review = await prisma.review.findUnique({ where: { id: review_id } });
            if (!review) throw new BadRequest("Review not found");
        }

        return prisma.report.create({
            data: {
                reporter_id,
                review_id,
                reason,
                reason_type: reason_type as ReportType
            }
        });
    }


    getAll() {
        return prisma.report.findMany({
            include: {
                reporter: {
                    select: { id: true, username: true, email: true }
                },
                review: true
            },
            orderBy: { created_at: 'desc' }
        });
    }


    getById(id: string) {
        return prisma.report.findUnique({
            where: { id },
            include: {
                reporter: {
                    select: { id: true, username: true }
                },
                review: true
            }
        });
    }


    getByReview(review_id: string) {
        return prisma.report.findMany({
            where: { review_id }
        });
    }


    async update(id: string) {
        const report = await prisma.report.findUnique({
            where: { id }
        });

        if (!report) {
            throw new NotFound("Report not found");
        }

        return prisma.report.update({
            where: { id },
            data: { is_checked: true }
        });
    }


    async delete(id: string) {
        const report = await prisma.report.findUnique({
            where: { id }
        });

        if (!report) {
            throw new NotFound("Report not found");
        }

        return prisma.report.delete({
            where: { id }
        });
    }
}

export const reportService = new ReportService();
