import {BaseMapper} from '../base.mapper.js';
import {
    PlaylistResponseAddDto, PlaylistResponseDeleteDto,
    PlaylistResponseDto,
    PlaylistResponseUpdateDto
} from "../../types/playlists/playlist.dto.js";
import {Playlists} from "../../generated/prisma/client.js";

class PlaylistMapper extends BaseMapper<Playlists, PlaylistResponseDto> {

    /**
     * Implémentation de la méthode abstraite
     */
    protected mapOne(playlist: Playlists): PlaylistResponseDto  {
        return {
            id: playlist.id,
            user_id: playlist.user_id,
            name: playlist.name,
            created_at: playlist.created_at,
            updated_at: playlist.updated_at
        };
    }

    toAddDto(playlist: Playlists): PlaylistResponseAddDto {
        return {
            id: playlist.id,
            user_id: playlist.user_id,
            name: playlist.name,
            created_at: playlist.created_at
        }
    }

    toUpdateDto(playlist: Playlists): PlaylistResponseUpdateDto {
        return {
            id: playlist.id,
            name: playlist.name,
            is_public: playlist.is_public,
            updated_at: playlist.updated_at
        }
    }

    toDeleteDto(playlist: Playlists): PlaylistResponseDeleteDto {
        return {
            id: playlist.id,
            user_id: playlist.user_id,
            name: playlist.name
        }
    }
}

export const playlistMapper = new PlaylistMapper();