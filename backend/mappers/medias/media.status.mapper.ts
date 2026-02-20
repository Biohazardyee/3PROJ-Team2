// mappers/media.status.mapper.ts
import type {UserMediaStatus} from '../../generated/prisma/browser.js';
import {BaseMapper} from '../base.mapper.js';
import {MediaStatusResponseDto} from "../../types/medias/media.status.dto.js";

export class MediaStatusMapper extends BaseMapper<UserMediaStatus, MediaStatusResponseDto> {

    /**
     * Implémentation de la méthode abstraite
     */
    protected mapOne(userMediaStatus: UserMediaStatus): MediaStatusResponseDto {
        return {
            user_id: userMediaStatus.user_id,
            media_id: userMediaStatus.media_id,
            status: userMediaStatus.status,
            created_at: userMediaStatus.created_at,
        };
    }
}

export const mediaStatusMapper = new MediaStatusMapper();