import dotenv from 'dotenv';
import { BadRequest, NotFound } from "../../../utils/errors.js";
import { isEmptyString } from '../../../utils/helpers.js';

dotenv.config();

const URL = process.env.API_ROOT_URL;
const API_KEY = process.env.API_KEY;

export class TagService {

    async getTagInfo(data: { tag: string }) {

        const { tag } = data;

        if (isEmptyString(tag)) {
            throw new BadRequest('Tag cannot be empty');
        }

        const synthesize_URL =
            `${URL}?method=tag.getinfo` +
            `&api_key=${API_KEY}` +
            `&tag=${encodeURIComponent(tag)}` +
            `&format=json`;

        const response = await fetch(synthesize_URL);

        const tagInfo = await response.json();

        if (tagInfo.error) {
            throw new NotFound(tagInfo.message || 'Tag not found');
        }

        return tagInfo;
    }

    async getTagTopArtists(data: { tag: string }) {

        const { tag } = data;

        if (isEmptyString(tag)) {
            throw new BadRequest('Tag cannot be empty');
        }

        const synthesize_URL =
            `${URL}?method=tag.gettopartists` +
            `&api_key=${API_KEY}` +
            `&tag=${encodeURIComponent(tag)}` +
            `&format=json`;

        const response = await fetch(synthesize_URL);

        const topArtists = await response.json();

        if (topArtists.error) {
            throw new NotFound(topArtists.message || 'Tag not found');
        }

        return topArtists;
    }

    async getTagTopAlbums(data: { tag: string }) {

        const { tag } = data

        if (isEmptyString(tag)) {
            throw new BadRequest('Tag cannot be empty');
        }
        const synthesize_URL =
            `${URL}?method=tag.gettopalbums` +
            `&api_key=${API_KEY}` +
            `&tag=${encodeURIComponent(tag)}` +
            `&format=json`;

        const response = await fetch(synthesize_URL);

        const topAlbums = await response.json();

        if (topAlbums.error) {
            throw new NotFound(topAlbums.message || 'Tag not found');
        }

        return topAlbums;
    }

    async getTagTopTracks(data: { tag: string }) {

        const { tag } = data;

        if (isEmptyString(tag)) {
            throw new BadRequest('Tag cannot be empty');
        }

        const synthesize_URL =
            `${URL}?method=tag.gettoptracks` +
            `&api_key=${API_KEY}` +
            `&tag=${encodeURIComponent(tag)}` +
            `&format=json`;

        const response = await fetch(synthesize_URL);

        const topTracks = await response.json();

        if (topTracks.error) {
            throw new NotFound(topTracks.message || 'Tag not found');
        }

        return topTracks;
    }

    async getSimilarTags(data: { tag: string }) {

        const { tag } = data;

        if (isEmptyString(tag)) {
            throw new BadRequest('Tag cannot be empty');
        }

        const synthesize_URL =
            `${URL}?method=tag.getsimilar` +
            `&api_key=${API_KEY}` +
            `&tag=${encodeURIComponent(tag)}` +
            `&format=json`;

        const response = await fetch(synthesize_URL);
        const similarTags = await response.json();

        if (similarTags.error) {
            throw new NotFound(similarTags.message || 'Tag not found');
        }

        return similarTags;
    }
}

export const tagService = new TagService();