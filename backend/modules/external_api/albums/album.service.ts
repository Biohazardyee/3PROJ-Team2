import dotenv from 'dotenv';
import { BadRequest, NotFound } from "../../../utils/errors.js";
import { isEmptyString } from '../../../utils/helpers.js';
import { PrismaDb } from '../../../config/database.js';

dotenv.config();

const URL: string | undefined = process.env.API_ROOT_URL;
const API_KEY: string | undefined = process.env.API_KEY;
const CACHE_TTL_MINUTES = 60;

export class AlbumService {

    async getAlbumInfo(data: {
        mbid: string; artist: string; album: string;
    }): Promise<any> {
        const { mbid, artist, album } = data;
        let api_id: string;
        let url: string;

        if (!isEmptyString(mbid)) {
            api_id = `album:mbid:${mbid}`;
            url = `${URL}?method=album.getinfo&api_key=${API_KEY}&mbid=${encodeURIComponent(mbid)}&format=json`;
        } else if (!isEmptyString(artist) && !isEmptyString(album)) {
            api_id = `album:name:${artist}:${album}`;
            url = `${URL}?method=album.getinfo&api_key=${API_KEY}&artist=${encodeURIComponent(artist)}&album=${encodeURIComponent(album)}&format=json`;
        } else {
            throw new BadRequest('You must provide either mbid OR artist + album');
        }


        let mediaRecord = await PrismaDb.medias.findUnique({
            where: { api_id },
        });


        if (!mediaRecord || mediaRecord.expires_at <= new Date()) {
            console.log("Appel API LastFM (Cache expiré ou inexistant)");
            const response: Response = await fetch(url);
            const albumInfo: any = await response.json();

            if (albumInfo.error) {
                throw new NotFound(albumInfo.message || 'Album not found');
            }

            mediaRecord = await PrismaDb.medias.upsert({
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
        } else {
            console.log("Cache utilisé");
        }

        return {
            id: mediaRecord.id, 
            ...(mediaRecord.content as Object) 
        };
    }

    async albumGetTags(data: { mbid: string }): Promise<any> {
        const { mbid } = data;

        if (isEmptyString(mbid)) throw new BadRequest('MBID cannot be empty');

        const api_id = `album:tags:${mbid}`;

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

    async getSimilarAlbums(data: { artist: string; album: string }): Promise<any> {
        const { artist, album } = data;
        const api_id = `album:discovery:${artist}:${album}`;

        const cached = await PrismaDb.medias.findUnique({ where: { api_id } });
        if (cached && cached.expires_at > new Date()) return cached.content;

        try {

            const artistRes: Response = await fetch(`${URL}?method=artist.getsimilar&artist=${encodeURIComponent(artist)}&api_key=${API_KEY}&limit=6&format=json`);
            const artistData: any = await artistRes.json();
            const similarArtists: any = artistData.similarartists?.artist || [];


            const albumPromises: any = similarArtists.map(async (similarArtist: any) => {
                const topRes: Response = await fetch(`${URL}?method=artist.gettopalbums&artist=${encodeURIComponent(similarArtist.name)}&api_key=${API_KEY}&limit=1&format=json`);
                const topData: any = await topRes.json();
                const basicAlbum = topData.topalbums?.album?.[0];

                if (!basicAlbum) return null;

                const hasImage = basicAlbum.image?.some((img: any) => img["#text"] && img["#text"] !== "");

                if (!hasImage) {
                    const fullInfoRes: Response = await fetch(`${URL}?method=album.getinfo&api_key=${API_KEY}&artist=${encodeURIComponent(similarArtist.name)}&album=${encodeURIComponent(basicAlbum.name)}&format=json`);
                    const fullInfoData: any = await fullInfoRes.json();
                    return fullInfoData.album || basicAlbum;
                }

                return basicAlbum;
            });

            const discoveryAlbums = (await Promise.all(albumPromises)).filter(a => a !== null);


            await PrismaDb.medias.upsert({
                where: { api_id },
                update: {
                    content: discoveryAlbums,
                    expires_at: new Date(Date.now() + CACHE_TTL_MINUTES * 60 * 1000)
                },
                create: {
                    api_id,
                    content: discoveryAlbums,
                    expires_at: new Date(Date.now() + CACHE_TTL_MINUTES * 60 * 1000)
                },
            });

            return discoveryAlbums;
        } catch (error) {
            console.error("Discovery error:", error);
            return [];
        }
    }
}

export const albumService = new AlbumService();