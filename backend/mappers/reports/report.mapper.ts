import {BaseMapper} from '../base.mapper.js';
import {Reports} from "../../generated/prisma/client.js";
import {ReportResponseAddDto, ReportResponseDto} from "../../types/reports/report.dto";


class ReportMapper extends BaseMapper<Reports, ReportResponseDto> {

    /**
     * Implémentation de la méthode abstraite
     */
    protected mapOne(report: Reports): ReportResponseDto  {
        return {
            id: report.id,
            reporter_id: report.reporter_id,
            review_id: report.review_id,
            profile_id: report.profile_id,
            comment_id: report.comment_id,
            reason: report.reason,
            reason_type: report.reason_type,
            is_checked: report.is_checked,
            created_at: report.created_at
        };
    }

    toAddDto(report: Reports): ReportResponseAddDto {
        return {
            id: report.id,
            reporter_id: report.reporter_id,
            review_id: report.review_id,
            profile_id: report.profile_id,
            comment_id: report.comment_id,
            reason: report.reason,
            reason_type: report.reason_type,
            created_at: report.created_at
        }
    }
}

export const reportMapper = new ReportMapper();