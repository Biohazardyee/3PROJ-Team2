import type { UserMediaStatus } from "../../generated/prisma/browser.js";
import { BaseMapper } from "../base.mapper.js";
import { MediaStatusResponseDto } from "../../types/medias/media.status.dto.js";
import { mediaMapper } from "./media.mapper.js"; // Importe le mapper de média

export class MediaStatusMapper extends BaseMapper<any, MediaStatusResponseDto> {
  // src/mappers/medias/media.status.mapper.ts

  // src/mappers/medias/media.status.mapper.ts

  protected mapOne(userMediaStatus: any): MediaStatusResponseDto {
    return {
      user_id: userMediaStatus.user_id,
      media_id: userMediaStatus.media_id,
      status: userMediaStatus.status,
      created_at: userMediaStatus.created_at,
      media: userMediaStatus.media
        ? mediaMapper.toDto(userMediaStatus.media)
        : undefined,
    };
  }
}

export const mediaStatusMapper = new MediaStatusMapper();
