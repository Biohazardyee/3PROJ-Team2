import {ReportTypes} from "../../generated/prisma/enums";

// Responses interfaces
export interface ReportResponseDto {
    id: string;
    reporter_id: string;
    review_id: string | null;
    profile_id: string | null;
    comment_id: string | null;
    reason: string;
    reason_type: ReportTypes;
    is_checked: boolean;
    created_at: Date;
}

export interface ReportResponseAddDto {
    id: string
    reporter_id: string;
    review_id: string | null;
    profile_id: string | null;
    comment_id: string | null;
    reason: string;
    reason_type: ReportTypes;
    created_at: Date;
}

// Post interfaces
export interface ReportAddDto {
    reporter_id: string;
    review_id?: string | null;
    profile_id?: string | null;
    comment_id?: string | null;
    reason: string;
    reason_type: ReportTypes;
}


export interface ReportUpdateDto {
    reason?: string;
    is_checked?: boolean;
}

export interface ReportDeleteResponseDto {
    id: string;
    reporter_id: string;
    is_checked: boolean;
}