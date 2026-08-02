import { PlaylistResponseAddDto } from '../playlists/playlist.dto.js';

// Spotify API response shapes
export interface SpotifyTokenResponse {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    scope?: string;
    error?: string;
    error_description?: string;
}

export interface SpotifyProfile {
    id: string;
    display_name: string | null;
}

// Response interfaces
export interface SpotifyPlaylistSummary {
    id: string;
    name: string;
    image: string | null;
    tracksTotal: number;
    imported?: boolean;
}

export interface SpotifyAlbumRef {
    name: string;
    artist: string;
    cover: string | null;
}

export interface SpotifyPlaylistAlbumsResult {
    albums: SpotifyAlbumRef[];
    totalTracks: number;
    skippedTracks: number;
}

export interface ImportPlaylistResult {
    playlist: PlaylistResponseAddDto;
    importedAlbums: number;
    totalAlbums: number;
    totalTracks: number;
    skippedTracks: number;
}

export interface SpotifyNowPlaying {
    isPlaying: boolean;
    trackName: string;
    artist: string;
    albumName: string;
    albumArt: string | null;
    progressMs: number;
    durationMs: number;
    spotifyUrl: string | null;
}
