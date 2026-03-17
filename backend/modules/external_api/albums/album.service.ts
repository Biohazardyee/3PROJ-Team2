import dotenv from 'dotenv';
import {BadRequest, NotFound} from "../../../utils/errors.js";
import {isEmptyString} from '../../../utils/helpers.js';
import {PrismaDb} from '../../../config/database.js';

dotenv.config();

const URL: string | undefined = process.env.API_ROOT_URL;
const API_KEY: string | undefined = process.env.API_KEY;
const CACHE_TTL_MINUTES = 60;

export class AlbumService {

    async getAlbumInfo(data: { artist: string; album: string }): Promise<any> {
        const {artist, album} = data;

        if (isEmptyString(artist)) throw new BadRequest('Artist cannot be empty');
        if (isEmptyString(album)) throw new BadRequest('Album cannot be empty');

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

        if (isEmptyString(mbid)) throw new BadRequest('MBID cannot be empty');

        const api_id = `album:${mbid}`;

        // Vérifier le cache
        const cached = await PrismaDb.medias.findFirst({
            where: {
                api_id,
                expires_at: { gt: new Date() },
            },
        });

        if (cached) {
            console.log("Information retrieves with caches");
            return cached.content;
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

        // Mettre en cache
        await PrismaDb.medias.upsert({
            where: { api_id },
            update: {
                content: albumInfo,
                expires_at: new Date(Date.now() + CACHE_TTL_MINUTES * 60 * 1000),
            },
            create: {
                api_id,
                content: albumInfo,
                expires_at: new Date(Date.now() + CACHE_TTL_MINUTES * 60 * 1000),
            },
        });

        console.log("No caches uses");

        return albumInfo;
    }

    async albumGetTags(data: { mbid: string }): Promise<any> {
        const {mbid} = data;

        if (isEmptyString(mbid)) throw new BadRequest('MBID cannot be empty');

        const api_id = `album:tags:${mbid}`;

        // Vérifier le cache
        const cached = await PrismaDb.medias.findFirst({
            where: {
                api_id,
                expires_at: { gt: new Date() },
            },
        });

        if (cached) {
            return cached.content;
        }

        const tags_URL: string =
            `${URL}?method=album.gettoptags` +
            `&api_key=${API_KEY}` +
            `&mbid=${encodeURIComponent(mbid)}` +
            `&autocorrect=1` +
            `&format=json`;

        const response: Response = await fetch(tags_URL);
        const tagsInfo: any = await response.json();

        if (tagsInfo.error) {
            throw new NotFound(tagsInfo.message || 'Tags not found for the album');
        }

        // Mettre en cache
        await PrismaDb.medias.upsert({
            where: { api_id },
            update: {
                content: tagsInfo,
                expires_at: new Date(Date.now() + CACHE_TTL_MINUTES * 60 * 1000),
            },
            create: {
                api_id,
                content: tagsInfo,
                expires_at: new Date(Date.now() + CACHE_TTL_MINUTES * 60 * 1000),
            },
        });

        return tagsInfo;
    }
}

export const albumService = new AlbumService();