// mappers/media.mapper.ts
import type {Medias} from '../../generated/prisma/browser.js';
import {BaseMapper} from '../base.mapper.js';
import {MediaResponseDto} from "../../types/medias/media.dto.js";

export class MediaMapper extends BaseMapper<Medias, MediaResponseDto> {

    /**
     * Implémentation de la méthode abstraite
     */
    protected mapOne(media: Medias): MediaResponseDto {
        return {
            id: media.id,
            api_id: media.api_id,
            created_at: media.created_at,
            rating: media.rating ?? 0,
        };
    }
}

export const mediaMapper = new MediaMapper();