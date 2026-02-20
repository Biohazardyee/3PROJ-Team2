import dotenv from 'dotenv';
import {BadRequest, NotFound} from "../../../utils/errors.js";
import {isEmptyString, isValidBoolean, isValidStringLength} from '../../../utils/helpers.js';

dotenv.config();

const URL: string | undefined = process.env.API_ROOT_URL;
const API_KEY: string | undefined = process.env.API_KEY;

export class AlbumService {

    async getAlbumInfo(data: { artist: string; album: string }): Promise<any> {

        const {artist, album} = data;

        if (isEmptyString(artist)) {
            throw new BadRequest('Artist cannot be empty');
        }

        if (isEmptyString(album)) {
            throw new BadRequest('Album cannot be empty');
        }

        const synthesize_URL: string =
            `${URL}?method=album.getinfo` +
            `&api_key=${API_KEY}` +
            `&artist=${encodeURIComponent(artist)}` +
            `&album=${encodeURIComponent(album)}` +
            `&format=json`;

        const response: Response = await fetch(synthesize_URL);

        const albumInfo: any = await response.json();

        if (albumInfo.error) {
            throw new NotFound(albumInfo.message || 'Album not found');
        }

        return albumInfo;
    }

    async getAlbumInfoById(data: { mbid: string }): Promise<any> {

        const {mbid} = data;

        if (isEmptyString(mbid)) {
            throw new BadRequest('MBID cannot be empty');
        }

        const synthesize_URL: string =
            `${URL}?method=album.getinfo` +
            `&api_key=${API_KEY}` +
            `&mbid=${encodeURIComponent(mbid)}` +
            `&format=json`;

        const response: Response = await fetch(synthesize_URL);

        const albumInfo: any = await response.json();

        if (albumInfo.error) {
            throw new NotFound(albumInfo.message || 'Album not found');
        }

        return albumInfo;
    }


    // to redo, we need to use the mbid instead, using artist and album name doesnt work
    async albumGetTags(data: { mbid: string }): Promise<any> {

        const {mbid} = data;

        if (isEmptyString(mbid)) {
            throw new BadRequest('MBID cannot be empty');
        }


        const tags_URL: string =
            `${URL}?method=album.gettoptags` +
            `&api_key=${API_KEY}` +
            `&mbid=${encodeURIComponent(mbid)}` +
            `autocorrect=1` +
            `&format=json`;

        const response: Response = await fetch(tags_URL);

        const tagsInfo: any = await response.json();

        if (tagsInfo.error) {
            throw new NotFound(tagsInfo.message || 'Tags not found for the album');
        }

        return tagsInfo;
    }
}


export const albumService = new AlbumService();