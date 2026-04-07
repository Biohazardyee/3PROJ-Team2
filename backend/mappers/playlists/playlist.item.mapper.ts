import { BaseMapper } from "../base.mapper.js";
import { PlaylistItemResponseDto } from "../../types/playlists/playlist.item.dto.js";
import { PlaylistItems } from "../../generated/prisma/client.js";

class PlaylistItemMapper extends BaseMapper<
  PlaylistItems,
  PlaylistItemResponseDto
> {
  /**
   * Implémentation de la méthode abstraite
   */
  protected mapOne(item: any): PlaylistItemResponseDto {
    return {
      id: item.id,
      playlist_id: item.playlist_id,
      media_id: item.media_id,
      created_at: item.created_at,
      media: item.media, 
    };
  }
}

export const playlistItemMapper = new PlaylistItemMapper();
