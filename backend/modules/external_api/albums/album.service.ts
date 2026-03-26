import dotenv from 'dotenv';
import {BadRequest, NotFound} from "../../../utils/errors.js";
import {isEmptyString} from '../../../utils/helpers.js';
import {PrismaDb} from '../../../config/database.js';

dotenv.config();

const URL: string | undefined = process.env.API_ROOT_URL;
const API_KEY: string | undefined = process.env.API_KEY;
const CACHE_TTL_MINUTES = 60;

export class AlbumService {

    async getAlbumInfo(data: {
        mbid: string;
        artist: string;
        album: string;
    }): Promise<any> {
        const { mbid, artist, album } = data;

        let api_id: string;
        let url: string;

        // Cas 1 : MBID
        if (!isEmptyString(mbid)) {
            api_id = `album:mbid:${mbid}`;

            url =
                `${URL}?method=album.getinfo` +
                `&api_key=${API_KEY}` +
                `&mbid=${encodeURIComponent(mbid)}` +
                `&format=json`;
        }

        // Cas 2 : artist + album
        else if (
            !isEmptyString(artist) &&
            !isEmptyString(album)
        ) {
            api_id = `album:name:${artist}:${album}`;

            url =
                `${URL}?method=album.getinfo` +
                `&api_key=${API_KEY}` +
                `&artist=${encodeURIComponent(artist)}` +
                `&album=${encodeURIComponent(album)}` +
                `&format=json`;
        }

        // Aucun des deux
        else {
            throw new BadRequest('You must provide either mbid OR artist + album');
        }

        // Vérifier le cache
        const cached = await PrismaDb.medias.findUnique({
            where: { api_id },
        });

        if (cached && cached.expires_at > new Date()) {
            console.log("Cache utilisé");
            return cached.content;
        }

        // Appel API
        const response: Response = await fetch(url);
        const albumInfo: any = await response.json();

        if (albumInfo.error) {
            throw new NotFound(albumInfo.message || 'Album not found');
        }

        // Mise en cache
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

        console.log("Pas de cache");

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