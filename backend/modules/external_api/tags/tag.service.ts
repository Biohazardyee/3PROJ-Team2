import dotenv from 'dotenv';
import {BadRequest, NotFound} from "../../../utils/errors.js";
import {isEmptyString} from '../../../utils/helpers.js';

dotenv.config();

const URL: string | undefined = process.env.API_ROOT_URL;
const API_KEY: string | undefined = process.env.API_KEY;

export class TagService {

    async getTagInfo(data: { tag: string }): Promise<any> {

        const {tag} = data;

        if (isEmptyString(tag)) {
            throw new BadRequest('Tag cannot be empty');
        }

        const synthesize_URL: string =
            `${URL}?method=tag.getinfo` +
            `&api_key=${API_KEY}` +
            `&tag=${encodeURIComponent(tag)}` +
            `&format=json`;

        const response: Response = await fetch(synthesize_URL);

        const tagInfo: any = await response.json();

        if (tagInfo.error) {
            throw new NotFound(tagInfo.message || 'Tag not found');
        }

        return tagInfo;
    }

    async getTagTopArtists(data: { tag: string }): Promise<any> {

        const {tag} = data;

        if (isEmptyString(tag)) {
            throw new BadRequest('Tag cannot be empty');
        }

        const synthesize_URL: string =
            `${URL}?method=tag.gettopartists` +
            `&api_key=${API_KEY}` +
            `&tag=${encodeURIComponent(tag)}` +
            `&format=json`;

        const response: Response = await fetch(synthesize_URL);

        const topArtists: any = await response.json();

        if (topArtists.error) {
            throw new NotFound(topArtists.message || 'Tag not found');
        }

        return topArtists;
    }

    async getTagTopAlbums(data: { tag: string }): Promise<any> {

        const {tag} = data

        if (isEmptyString(tag)) {
            throw new BadRequest('Tag cannot be empty');
        }
        const synthesize_URL: string =
            `${URL}?method=tag.gettopalbums` +
            `&api_key=${API_KEY}` +
            `&tag=${encodeURIComponent(tag)}` +
            `&format=json`;

        const response: Response = await fetch(synthesize_URL);

        const topAlbums: any = await response.json();

        if (topAlbums.error) {
            throw new NotFound(topAlbums.message || 'Tag not found');
        }

        return topAlbums;
    }

    async getTagTopTracks(data: { tag: string }): Promise<any> {

        const {tag} = data;

        if (isEmptyString(tag)) {
            throw new BadRequest('Tag cannot be empty');
        }

        const synthesize_URL: string =
            `${URL}?method=tag.gettoptracks` +
            `&api_key=${API_KEY}` +
            `&tag=${encodeURIComponent(tag)}` +
            `&format=json`;

        const response: Response = await fetch(synthesize_URL);

        const topTracks: any = await response.json();

        if (topTracks.error) {
            throw new NotFound(topTracks.message || 'Tag not found');
        }

        return topTracks;
    }

    async getSimilarTags(data: { tag: string }): Promise<any> {

        const {tag} = data;

        if (isEmptyString(tag)) {
            throw new BadRequest('Tag cannot be empty');
        }

        const synthesize_URL: string =
            `${URL}?method=tag.getsimilar` +
            `&api_key=${API_KEY}` +
            `&tag=${encodeURIComponent(tag)}` +
            `&format=json`;

        const response: Response = await fetch(synthesize_URL);
        const similarTags: any = await response.json();

        if (similarTags.error) {
            throw new NotFound(similarTags.message || 'Tag not found');
        }

        return similarTags;
    }
}

export const tagService = new TagService();