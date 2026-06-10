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

export interface Report {
    id: string;
    reporter_id: string;
    reporter?: {
        username: string;
    };
    profile_id: string | null;
    profile?: {
        username: string;
    };
    review_id: string | null;
    review?: {
        user_id: string;
    };
    comment_id: string | null;
    comment?: {
        user_id: string;
    };
    reason: string;
    reason_type: 'comment' | 'profile' | 'review';
    is_checked: boolean;
    created_at: string;
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