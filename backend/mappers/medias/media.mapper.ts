// mappers/media.mapper.ts
import type { Medias } from "../../generated/prisma/browser.js";
import { BaseMapper } from "../base.mapper.js";
import { MediaResponseDto } from "../../types/medias/media.dto.js";

export class MediaMapper extends BaseMapper<Medias, MediaResponseDto> {
  protected mapOne(media: any): MediaResponseDto {
    const content = media.content as any;

    return {
      id: media.id,
      api_id: media.api_id,
      created_at: media.created_at,
      name: content?.name || "Titre inconnu",
      artist: content?.artist || "Artiste inconnu",
      cover: content?.cover || null,
      mbid: content?.mbid || null, 

      ...(media.rating !== undefined ? { rating: media.rating } : {}),
    };
  }
}

export const mediaMapper = new MediaMapper();
