// mappers/media.mapper.ts
import type { Medias } from "../../generated/prisma/browser.js";
import { BaseMapper } from "../base.mapper.js";
import { MediaResponseDto } from "../../types/medias/media.dto.js";

export class MediaMapper extends BaseMapper<Medias, MediaResponseDto> {
  /**
   * Implémentation de la méthode abstraite
   * On "aplatit" l'objet content pour que le DTO soit complet
   */
  protected mapOne(media: any): MediaResponseDto {
 
    const content = media.content as any;

    return {
      id: media.id,
      api_id: media.api_id,
      created_at: media.created_at,
 
      rating: media.rating ?? 0,

      name: content?.name || "Titre inconnu",
      artist: content?.artist || "Artiste inconnu",
      cover: content?.cover || null,
      
    };
  }
}

export const mediaMapper = new MediaMapper();
