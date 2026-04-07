import { BaseMapper } from "../base.mapper.js";
import {
  PlaylistResponseAddDto,
  PlaylistResponseDeleteDto,
  PlaylistResponseDto,
  PlaylistResponseUpdateDto,
} from "../../types/playlists/playlist.dto.js";
import { PlaylistItems, Playlists } from "../../generated/prisma/client.js";

type PlaylistWithItems = Playlists & {
  items?: PlaylistItems[];
};

class PlaylistMapper extends BaseMapper<Playlists, PlaylistResponseDto> {
  /**
   * Implémentation de la méthode abstraite
   */

  protected mapOne(playlist: PlaylistWithItems): PlaylistResponseDto {
    return {
      id: playlist.id,
      user_id: playlist.user_id,
      name: playlist.name,
      image_url: playlist.image_url
        ? `data:image/jpeg;base64,${Buffer.from(playlist.image_url).toString("base64")}`
        : undefined,
      created_at: playlist.created_at,
      updated_at: playlist.updated_at,
      // Maintenant TypeScript reconnaît 'items' !
      items: playlist.items
        ? playlist.items.map((item) => ({
            media_id: item.media_id,
          }))
        : [],
    };
  }

  toAddDto(playlist: PlaylistWithItems): PlaylistResponseAddDto {
    return {
      id: playlist.id,
      user_id: playlist.user_id,
      name: playlist.name,
      image_url: playlist.image_url
        ? `data:image/jpeg;base64,${Buffer.from(playlist.image_url).toString("base64")}`
        : undefined,
      created_at: playlist.created_at,
    };
  }

  toUpdateDto(playlist: Playlists): PlaylistResponseUpdateDto {
    return {
      id: playlist.id,
      name: playlist.name,
      is_public: playlist.is_public,
      image_url: playlist.image_url
        ? `data:image/jpeg;base64,${Buffer.from(playlist.image_url).toString("base64")}`
        : undefined,
      updated_at: playlist.updated_at,
    };
  }

  toDeleteDto(playlist: Playlists): PlaylistResponseDeleteDto {
    return {
      id: playlist.id,
      user_id: playlist.user_id,
      name: playlist.name,
    };
  }
}

export const playlistMapper = new PlaylistMapper();
