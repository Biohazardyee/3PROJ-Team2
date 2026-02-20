import {BaseMapper} from '../base.mapper.js';
import {
    PlaylistItemResponseDto,
} from "../../types/playlists/playlist.item.dto.js";
import {PlaylistItems} from "../../generated/prisma/client.js";

class PlaylistItemMapper extends BaseMapper<PlaylistItems, PlaylistItemResponseDto> {

    /**
     * Implémentation de la méthode abstraite
     */
    protected mapOne(playlistItem: PlaylistItems): PlaylistItemResponseDto {
        return {
            id: playlistItem.id,
            playlist_id: playlistItem.playlist_id,
            media_id: playlistItem.media_id,
            created_at: playlistItem.created_at,
        };
    }
}

export const playlistItemMapper = new PlaylistItemMapper();