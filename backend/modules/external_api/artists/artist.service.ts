import dotenv from 'dotenv';
import { BadRequest, NotFound } from "../../../utils/errors.js";
import { isEmptyString, isValidBoolean, isValidStringLength } from '../../../utils/helpers.js';

dotenv.config();

const URL = process.env.API_ROOT_URL;
const API_KEY = process.env.API_KEY;

export class ArtistService {
    async getArtistInfo(data: { artist: string }) {

        const { artist } = data;

        if (isEmptyString(artist)) {
            throw new BadRequest('Artist cannot be empty');
        }

        const synthesize_URL =
            `${URL}?method=artist.getinfo` +
            `&api_key=${API_KEY}` +
            `&artist=${encodeURIComponent(artist)}` +
            `&format=json`;

        const response = await fetch(synthesize_URL);
        const artistInfo = await response.json();

        if (artistInfo.error) {
            throw new NotFound(artistInfo.message || 'Artist not found');
        }
        return artistInfo;
    }

    async getArtistbyId(data: { mbid: string }) {
        const { mbid } = data;

        if (isEmptyString(mbid)) {
            throw new BadRequest('MBID cannot be empty');
        }

        const synthesize_URL =
            `${URL}?method=artist.getinfo` +
            `&api_key=${API_KEY}` +
            `&mbid=${encodeURIComponent(mbid)}` +
            `&format=json`;

        const response = await fetch(synthesize_URL);

        const artistInfo = await response.json();

        if (artistInfo.error) {
            throw new NotFound(artistInfo.message || 'Artist not found');
        }

        return artistInfo;
    }

    async getTopAlbums(data: { artist: string }) {

        const { artist } = data;

        if (isEmptyString(artist)) {
            throw new BadRequest('Artist cannot be empty');
        }

        const topAlbums_URL =
            `${URL}?method=artist.gettopalbums` +
            `&api_key=${API_KEY}` +
            `&artist=${encodeURIComponent(artist)}` +
            `&format=json`;

        const response = await fetch(topAlbums_URL);
        const topAlbums = await response.json();

        if (topAlbums.error) {
            throw new NotFound(topAlbums.message || 'No top albums found for the artist');
        }

        return topAlbums;
    }

    async getArtistTopTags(data: { artist: string }) {

        const { artist } = data;
        if (isEmptyString(artist)) {
            throw new BadRequest('Artist cannot be empty');
        }
        const topTags_URL =
            `${URL}?method=artist.gettoptags` +
            `&api_key=${API_KEY}` +
            `&artist=${encodeURIComponent(artist)}` +
            `&format=json`;

        const response = await fetch(topTags_URL);

        const topTags = await response.json();

        if (topTags.error) {
            throw new NotFound(topTags.message || 'No top tags found for the artist');
        }
        return topTags;
    }

    async getArtistTopTracks(data: { artist: string }) {

        const { artist } = data;

        if (isEmptyString(artist)) {
            throw new BadRequest('Artist cannot be empty');
        }

        const topTracks_URL =
            `${URL}?method=artist.gettoptracks` +
            `&api_key=${API_KEY}` +
            `&artist=${encodeURIComponent(artist)}` +
            `&format=json`;

        const response = await fetch(topTracks_URL);

        const topTracks = await response.json();

        if (topTracks.error) {
            throw new NotFound(topTracks.message || 'No top tracks found for the artist');
        }
        return topTracks;
    }

    async getSimilarArtists(data: { mbid: string }) {

        const { mbid } = data;

        if (isEmptyString(mbid)) {
            throw new BadRequest('MBID cannot be empty');
        }

        const similarArtists_URL =
            `${URL}?method=artist.getsimilar` +
            `&api_key=${API_KEY}` +
            `&mbid=${encodeURIComponent(mbid)}` +
            `&limit=20` +
            `&format=json`;

        const response = await fetch(similarArtists_URL);

        const similarArtists = await response.json();


        if (similarArtists.error) {
            return { similarartists: { artist: [] } }; // empty list instead of throwing
        }


        return similarArtists;
    }
}

export const artistService = new ArtistService();