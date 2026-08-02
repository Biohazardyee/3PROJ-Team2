import {BaseMapper} from "../base.mapper.js";
import {
    PlaylistCollaboratorDto,
    PlaylistResponseAddDto,
    PlaylistResponseDeleteDto,
    PlaylistResponseDto,
    PlaylistResponseUpdateDto,
} from "../../types/playlists/playlist.dto.js";
import {PlaylistItems, Playlists} from "../../generated/prisma/client.js";
import {bufferToImageDataUri} from "../../utils/imageDataUri.js";

type PlaylistWithItems = Playlists & {
    items?: PlaylistItems[];
};

class PlaylistMapper extends BaseMapper<Playlists, PlaylistResponseDto> {
    /**
     * Implémentation de la méthode abstraite
     */

    protected mapOne(playlist: any): PlaylistResponseDto {
        const collaborators: PlaylistCollaboratorDto[] | undefined = playlist.collaborators
            ? playlist.collaborators.map((c: any): PlaylistCollaboratorDto => ({
                id: c.user.id,
                username: c.user.username,
                pseudo: c.user.pseudo,
                profile_picture: bufferToImageDataUri(c.user.profile_picture),
            }))
            : undefined;

        return {
            id: playlist.id,
            user_id: playlist.user_id,
            name: playlist.name,
            is_public: playlist.is_public,
            is_collaborative: playlist.is_collaborative ?? (collaborators ? collaborators.length > 0 : false),
            collaborators,
            image_url: playlist.image_url
                ? `data:image/jpeg;base64,${Buffer.from(playlist.image_url).toString("base64")}`
                : undefined,
            created_at: playlist.created_at,
            updated_at: playlist.updated_at,

            items: playlist.items ? playlist.items.map((item: any) => {

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
                    rating: ratingValue,
                    media: item.media ? {
                        id: item.media.id,
                        title: title,
                        cover: cover || '',
                        rating: ratingValue
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
                rating: reviewMap.get(item.media_id) || 0
            }));
        }
        return dto;
    }
}

export const playlistMapper = new PlaylistMapper();
