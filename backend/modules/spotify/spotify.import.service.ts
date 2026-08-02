import { spotifyService } from './spotify.service.js';
import { MediaService } from '../db/medias/media.service.js';
import { PlaylistService } from '../db/playlists/playlist.service.js';
import { playlistItemService } from '../db/playlists/playlist.item.service.js';
import { BadRequest } from '../../utils/errors.js';
import { PlaylistResponseAddDto } from '../../types/playlists/playlist.dto.js';
import { ImportPlaylistResult, SpotifyPlaylistAlbumsResult } from '../../types/spotify/spotify.dto.js';
import { PrismaDb } from '../../config/database.js';

const mediaService = new MediaService();
const playlistService = new PlaylistService();

async function fetchImageAsBase64(url: string | undefined | null): Promise<string | undefined> {
    if (!url) return undefined;

    try {
        const response: Response = await fetch(url);
        if (!response.ok) return undefined;

        const arrayBuffer: ArrayBuffer = await response.arrayBuffer();
        return Buffer.from(arrayBuffer).toString('base64');
    } catch (err) {
        return undefined;
    }
}

export class SpotifyImportService {
    async getImportedPlaylistIds(userId: string): Promise<Set<string>> {
        const rows = await PrismaDb.playlists.findMany({
            where: { user_id: userId, spotify_playlist_id: { not: null } },
            select: { spotify_playlist_id: true },
        });

        return new Set(rows.map((row) => row.spotify_playlist_id as string));
    }

    async importPlaylist(
        userId: string,
        spotifyPlaylistId: string,
        name: string,
        isPublic: boolean,
        coverImageUrl?: string,
    ): Promise<ImportPlaylistResult> {
        const {albums, totalTracks, skippedTracks}: SpotifyPlaylistAlbumsResult =
            await spotifyService.getPlaylistAlbums(userId, spotifyPlaylistId);

        if (albums.length === 0) {
            throw new BadRequest('Aucun album trouvé dans cette playlist Spotify');
        }

        const imageBase64: string | undefined = await fetchImageAsBase64(coverImageUrl);

        const playlist: PlaylistResponseAddDto = await playlistService.create({
            name,
            user_id: userId,
            is_public: isPublic,
            image_url: imageBase64,
            spotify_playlist_id: spotifyPlaylistId,
        });

        const syncedMedias = await mediaService.syncSearchResults(
            albums.map((album) => ({
                api_id: `album:${album.artist}:${album.name}`,
                name: album.name,
                artist: album.artist,
                cover: album.cover,
            })),
        );

        let importedAlbums = 0;
        for (const media of syncedMedias) {
            try {
                await playlistItemService.add({ playlist_id: playlist.id, media_id: media.id });
                importedAlbums++;
            } catch (err) {
                // album déjà présent dans la playlist (doublon) : on ignore et on continue
            }
        }

        return { playlist, importedAlbums, totalAlbums: albums.length, totalTracks, skippedTracks };
    }
}

export const spotifyImportService = new SpotifyImportService();
