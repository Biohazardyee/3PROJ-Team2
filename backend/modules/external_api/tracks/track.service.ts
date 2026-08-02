import dotenv from 'dotenv';
import {BadRequest, NotFound} from "../../../utils/errors.js";
import {isEmptyString} from '../../../utils/helpers.js';

dotenv.config();

const URL: string | undefined = process.env.API_ROOT_URL;
const API_KEY: string | undefined = process.env.API_KEY;

export class TrackService {

    async getTrackInfo(data: { artist: string; track: string }): Promise<any> {

        const {artist, track} = data;

        if (isEmptyString(artist)) {
            throw new BadRequest('Artist cannot be empty');
        }

        if (isEmptyString(track)) {
            throw new BadRequest('Track cannot be empty');
        }

        const synthesize_URL: string =
            `${URL}?method=track.getinfo` +
            `&api_key=${API_KEY}` +
            `&artist=${encodeURIComponent(artist)}` +
            `&track=${encodeURIComponent(track)}` +
            `&format=json`;

        const response: Response = await fetch(synthesize_URL);

        const trackInfo: any = await response.json();

        if (trackInfo.error) {
            throw new NotFound(trackInfo.message || 'Track not found');
        }
        return trackInfo;
    }

    async getSimilarTracks(data: { artist: string; track: string }): Promise<any> {

        const {artist, track} = data;

        if (isEmptyString(artist)) {
            throw new BadRequest('Artist cannot be empty');
        }

        if (isEmptyString(track)) {
            throw new BadRequest('Track cannot be empty');
        }

        const synthesize_URL: string =
            `${URL}?method=track.getsimilar` +
            `&api_key=${API_KEY}` +
            `&artist=${encodeURIComponent(artist)}` +
            `&track=${encodeURIComponent(track)}` +
            `&autocorrect=1` +
            `&format=json`;

        const response: Response = await fetch(synthesize_URL);

        const similarTracks: any = await response.json();

        if (similarTracks.error) {
            throw new NotFound(similarTracks.message || 'Track not found');
        }

        return similarTracks;
    }

    async getTrackPreview(data: { artist: string; track: string }): Promise<{
        previewUrl: string | null;
        artworkUrl: string | null;
        spotifyUrl: string;
    }> {
        const {artist, track} = data;

        if (isEmptyString(artist)) {
            throw new BadRequest('Artist cannot be empty');
        }

        if (isEmptyString(track)) {
            throw new BadRequest('Track cannot be empty');
        }

        const query: string = `${artist} ${track}`;
        const searchUrl: string =
            `https://itunes.apple.com/search?term=${encodeURIComponent(query)}` +
            `&media=music&entity=song&limit=1`;

        const response: Response = await fetch(searchUrl);
        const searchResult: any = await response.json();
        const match: any = searchResult.results?.[0];

        return {
            previewUrl: match?.previewUrl || null,
            artworkUrl: match?.artworkUrl100 || null,
            spotifyUrl: `https://open.spotify.com/search/${encodeURIComponent(query)}`,
        };
    }

    async getTopTrackTags(data: { artist: string; track: string }): Promise<any> {
        const {artist, track} = data;

        if (isEmptyString(artist)) {
            throw new BadRequest('Artist cannot be empty');
        }

        if (isEmptyString(track)) {
            throw new BadRequest('Track cannot be empty');
        }

        const synthesize_URL: string =
            `${URL}?method=track.gettoptags` +
            `&api_key=${API_KEY}` +
            `&artist=${encodeURIComponent(artist)}` +
            `&track=${encodeURIComponent(track)}` +
            `&format=json`;

        const response: Response = await fetch(synthesize_URL);

        const topTags: any = await response.json();

        if (topTags.error) {
            throw new NotFound(topTags.message || 'Track not found');
        }

        return topTags;
    }

}

export const trackService = new TrackService();