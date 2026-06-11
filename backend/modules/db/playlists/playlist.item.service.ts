import {PrismaDb} from "../../../config/database.js";
import {BadRequest, NotFound} from "../../../utils/errors.js";
import {isEmptyString} from "../../../utils/helpers.js";
import {
    PlaylistItemCreateDto,
    PlaylistItemResponseDto,
} from "../../../types/playlists/playlist.item.dto.js";
import {
    Playlists,
    Medias,
    PlaylistItems,
} from "../../../generated/prisma/browser.js";
import {playlistItemMapper} from "../../../mappers/playlists/playlist.item.mapper.js";

export class PlaylistItemService {
    async add(data: PlaylistItemCreateDto): Promise<PlaylistItemResponseDto> {
        if (isEmptyString(data.playlist_id)) {
            throw new BadRequest("Playlist_id is required");
        }
        if (isEmptyString(data.media_id)) {
            throw new BadRequest("Media_id is required");
        }

        const playlist: Playlists | null = await PrismaDb.playlists.findUnique({
            where: {
                id: data.playlist_id,
            },
        });

        if (!playlist) {
            throw new NotFound("Playlist not found");
        }

        const media: Medias | null = await PrismaDb.medias.findUnique({
            where: {
                id: data.media_id,
            },
        });

        if (!media) {
            throw new NotFound("Media not found");
        }

        const exists: PlaylistItems | null = await PrismaDb.playlistItems.findFirst(
            {
                where: {
                    playlist_id: data.playlist_id,
                    media_id: data.media_id,
                },
            },
        );

        if (exists) {
            throw new BadRequest("Media already in this playlist");
        }

        const playlistItem: PlaylistItems = await PrismaDb.playlistItems.create({
            data,
        });

        return playlistItemMapper.toDto(playlistItem);
    }

    async getAll(): Promise<PlaylistItemResponseDto[]> {
        const playlistItems: PlaylistItems[] =
            await PrismaDb.playlistItems.findMany({
                orderBy: {
                    created_at: "asc",
                },
            });
        return playlistItemMapper.toDtoList(playlistItems);
    }

    async getById(id: string): Promise<PlaylistItemResponseDto> {
        if (isEmptyString(id)) {
            throw new BadRequest("Playlist item id is required");
        }

        const playlistItem: PlaylistItems | null =
            await PrismaDb.playlistItems.findUnique({
                where: {
                    id,
                },
            });

        if (!playlistItem) {
            throw new NotFound("Playlist item not found");
        }

        return playlistItemMapper.toDto(playlistItem);
    }

    async getByPlaylistId(
        playlist_id: string,
    ): Promise<PlaylistItemResponseDto[]> {
        if (isEmptyString(playlist_id)) {
            throw new BadRequest("playlist_id is required");
        }

        const playlist: Playlists | null = await PrismaDb.playlists.findUnique({
            where: {
                id: playlist_id,
            },
        });

        if (!playlist) {
            throw new NotFound("Playlist not found");
        }

        const playlistItems: PlaylistItems[] =
            await PrismaDb.playlistItems.findMany({
                where: {
                    playlist_id,
                },
                include: {
                    media: true,
                },
            });

        return playlistItemMapper.toDtoList(playlistItems);
    }

    async delete(id: string): Promise<PlaylistItemResponseDto> {
        if (isEmptyString(id)) {
            throw new BadRequest("Playlist item id is required");
        }

        const playlistItem: PlaylistItems | null =
            await PrismaDb.playlistItems.findUnique({
                where: {
                    id,
                },
            });

        if (!playlistItem) {
            throw new NotFound("Playlist item not found");
        }

        const deletePlaylistItem: PlaylistItems =
            await PrismaDb.playlistItems.delete({
                where: {
                    id,
                },
            });

        return playlistItemMapper.toDto(deletePlaylistItem);
    }
}

export const playlistItemService = new PlaylistItemService();
