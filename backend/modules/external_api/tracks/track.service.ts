import dotenv from 'dotenv';
import { BadRequest, NotFound } from "../../../utils/errors.js";
import { isEmptyString } from '../../../utils/helpers.js';

dotenv.config();

const URL = process.env.API_ROOT_URL;
const API_KEY = process.env.API_KEY;

export class TrackService {

    async getTrackInfo(data: { artist: string; track: string }) {

        const { artist, track } = data;

        if (isEmptyString(artist)) {
            throw new BadRequest('Artist cannot be empty');
        }

        if (isEmptyString(track)) {
            throw new BadRequest('Track cannot be empty');
        }

        const synthesize_URL =
            `${URL}?method=track.getinfo` +
            `&api_key=${API_KEY}` +
            `&artist=${encodeURIComponent(artist)}` +
            `&track=${encodeURIComponent(track)}` +
            `&format=json`;

        const response = await fetch(synthesize_URL);

        const trackInfo = await response.json();

        if (trackInfo.error) {
            throw new NotFound(trackInfo.message || 'Track not found');
        }
        return trackInfo;
    }

    async getSimilarTracks(data: { artist: string; track: string }) {

        const { artist, track } = data;

        if (isEmptyString(artist)) {
            throw new BadRequest('Artist cannot be empty');
        }

        if (isEmptyString(track)) {
            throw new BadRequest('Track cannot be empty');
        }

        const synthesize_URL =
            `${URL}?method=track.getsimilar` +
            `&api_key=${API_KEY}` +
            `&artist=${encodeURIComponent(artist)}` +
            `&track=${encodeURIComponent(track)}` +
            `&autocorrect=1` +
            `&format=json`;

        const response = await fetch(synthesize_URL);

        const similarTracks = await response.json();

        if (similarTracks.error) {
            throw new NotFound(similarTracks.message || 'Track not found');
        }

        return similarTracks;
    }

    async getTopTrackTags(data: { artist: string; track: string }) {
        const { artist, track } = data;

        if (isEmptyString(artist)) {
            throw new BadRequest('Artist cannot be empty');
        }

        if (isEmptyString(track)) {
            throw new BadRequest('Track cannot be empty');
        }

        const synthesize_URL =
            `${URL}?method=track.gettoptags` +
            `&api_key=${API_KEY}` +
            `&artist=${encodeURIComponent(artist)}` +
            `&track=${encodeURIComponent(track)}` +
            `&format=json`;

        const response = await fetch(synthesize_URL);

        const topTags = await response.json();

        if (topTags.error) {
            throw new NotFound(topTags.message || 'Track not found');
        }

        return topTags;
    }

}

export const trackService = new TrackService();