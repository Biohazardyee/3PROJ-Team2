import {MediaStatus} from "../../generated/prisma/enums";

// Response Interface
export interface MediaStatusResponseDto {
    user_id: string;
    media_id: string;
    status: MediaStatus;
    created_at: Date;
}

// Post Interface
export interface MediaStatusCreateDto {
    user_id: string;
    media_id: string;
    status: MediaStatus;
}

export interface MediaStatusUpdateDto {
    status?: MediaStatus;
}