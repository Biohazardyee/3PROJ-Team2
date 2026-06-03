import {BaseMapper} from "../base.mapper.js";
import {
    PlaylistResponseAddDto,
    PlaylistResponseDeleteDto,
    PlaylistResponseDto,
    PlaylistResponseUpdateDto,
} from "../../types/playlists/playlist.dto.js";
import {PlaylistItems, Playlists} from "../../generated/prisma/client.js";

type PlaylistWithItems = Playlists & {
    items?: PlaylistItems[];
};

class PlaylistMapper extends BaseMapper<Playlists, PlaylistResponseDto> {
    /**
     * Implémentation de la méthode abstraite
     */

    // Dans votre classe PlaylistMapper
// Dans src/mappers/playlists/playlist.mapper.ts

    protected mapOne(playlist: any): PlaylistResponseDto {
        return {
            id: playlist.id,
            user_id: playlist.user_id,
            name: playlist.name,
            is_public: playlist.is_public,
            image_url: playlist.image_url
                ? `data:image/jpeg;base64,${Buffer.from(playlist.image_url).toString("base64")}`
                : undefined,
            created_at: playlist.created_at,
            updated_at: playlist.updated_at,

            items: playlist.items ? playlist.items.map((item: any) => {
                // 1. Parsing sécurisé
                let content = item.media?.content;
                if (typeof content === 'string') {
                    try {
                        content = JSON.parse(content);
                    } catch (e) {
                        content = {};
                    }
                }
                content = content || {};

                const title = content.album?.name || content.name || 'Sans titre';

                let cover = content.cover;
                if (!cover && content.image && Array.isArray(content.image)) {
                    const imgObj = content.image.find((i: any) => i.size === 'extralarge')
                        || content.image[content.image.length - 1];
                    cover = imgObj?.['#text'];
                }


                const ratingValue = item.rating || item.media?.rating || 0;

                return {
                    id: item.id,
                    media_id: item.media_id,
                    rating: ratingValue, // Défini maintenant
                    media: item.media ? {
                        id: item.media.id,
                        title: title,
                        cover: cover || '',
                        rating: ratingValue // On l'assigne aussi ici pour votre frontend
                    } : undefined
                };
            }) : [],
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

    toDtoWithRatings(playlist: any, reviewMap: Map<string, number>): PlaylistResponseDto {
        const dto = this.mapOne(playlist);

        if (dto.items) {
            dto.items = dto.items.map(item => ({
                ...item,
                rating: reviewMap.get(item.media_id) || 0 // Récupère la note user ou 0
            }));
        }
        return dto;
    }
}

export const playlistMapper = new PlaylistMapper();
