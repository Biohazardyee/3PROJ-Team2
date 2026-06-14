import dotenv from "dotenv";
import {BadRequest, NotFound} from "../../../utils/errors.js";
import {
    isEmptyString,
} from "../../../utils/helpers.js";

dotenv.config();

const URL: string | undefined = process.env.API_ROOT_URL;
const API_KEY: string | undefined = process.env.API_KEY;

export class ArtistService {
    async getArtistInfo(data: { artist: string }): Promise<any> {
        const {artist} = data;

        if (isEmptyString(artist)) {
            throw new BadRequest("Artist cannot be empty");
        }

        const synthesize_URL: string =
            `${URL}?method=artist.getinfo` +
            `&api_key=${API_KEY}` +
            `&artist=${encodeURIComponent(artist)}` +
            `&format=json`;

        const response: Response = await fetch(synthesize_URL);
        const artistInfo: any = await response.json();

        if (artistInfo.error) {
            throw new NotFound(artistInfo.message || "Artist not found");
        }
        return artistInfo;
    }

    async getArtistbyId(data: { mbid: string }): Promise<any> {
        const {mbid} = data;

        if (isEmptyString(mbid)) {
            throw new BadRequest("MBID cannot be empty");
        }

        const synthesize_URL: string =
            `${URL}?method=artist.getinfo` +
            `&api_key=${API_KEY}` +
            `&mbid=${encodeURIComponent(mbid)}` +
            `&format=json`;

        const response: Response = await fetch(synthesize_URL);

        const artistInfo: any = await response.json();

        if (artistInfo.error) {
            throw new NotFound(artistInfo.message || "Artist not found");
        }

        return artistInfo;
    }

    async getTopAlbums(data: { artist: string }): Promise<any> {
        const {artist} = data;

        if (isEmptyString(artist)) {
            throw new BadRequest("Artist cannot be empty");
        }

        const topAlbums_URL: string =
            `${URL}?method=artist.gettopalbums` +
            `&api_key=${API_KEY}` +
            `&artist=${encodeURIComponent(artist)}` +
            `&format=json`;

        const response: Response = await fetch(topAlbums_URL);
        const topAlbums: any = await response.json();

        if (topAlbums.error) {
            throw new NotFound(
                topAlbums.message || "No top albums found for the artist",
            );
        }

        return topAlbums;
    }

    async getArtistTopTags(data: { artist: string }): Promise<any> {
        const {artist} = data;
        if (isEmptyString(artist)) {
            throw new BadRequest("Artist cannot be empty");
        }
        const topTags_URL: string =
            `${URL}?method=artist.gettoptags` +
            `&api_key=${API_KEY}` +
            `&artist=${encodeURIComponent(artist)}` +
            `&format=json`;

        const response: Response = await fetch(topTags_URL);

        const topTags: any = await response.json();

        if (topTags.error) {
            throw new NotFound(topTags.message || "No top tags found for the artist");
        }
        return topTags;
    }

    async getArtistTopTracks(data: { artist: string }): Promise<any> {
        const {artist} = data;

        if (isEmptyString(artist)) {
            throw new BadRequest("Artist cannot be empty");
        }

        const topTracks_URL: string =
            `${URL}?method=artist.gettoptracks` +
            `&api_key=${API_KEY}` +
            `&artist=${encodeURIComponent(artist)}` +
            `&format=json`;

        const response: Response = await fetch(topTracks_URL);

        const topTracks: any = await response.json();

        if (topTracks.error) {
            throw new NotFound(
                topTracks.message || "No top tracks found for the artist",
            );
        }
        return topTracks;
    }

    async getSimilarArtists(data: {
        mbid?: string;
        artist?: string;
    }): Promise<any> {
        const {mbid, artist} = data;
        let url: string;

        if (mbid && !isEmptyString(mbid)) {
            url = `${URL}?method=artist.getsimilar&api_key=${API_KEY}&mbid=${encodeURIComponent(mbid)}&limit=20&format=json`;
        } else if (artist && !isEmptyString(artist)) {
            url = `${URL}?method=artist.getsimilar&api_key=${API_KEY}&artist=${encodeURIComponent(artist)}&limit=20&format=json`;
        } else {
            throw new BadRequest("MBID or Artist Name must be provided");
        }

        const response: Response = await fetch(url);
        const similarArtists: any = await response.json();

        if (similarArtists.error) {

            return {similarartists: {artist: []}};
        }

        return similarArtists;
    }
}

export const artistService = new ArtistService();
