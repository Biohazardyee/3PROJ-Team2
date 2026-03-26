import dotenv from 'dotenv';
import { BadRequest, NotFound } from "../../utils/errors.js";
import { isEmptyString } from '../../utils/helpers.js';
import { PrismaDb } from '../../config/database.js';

dotenv.config();

const URL: string | undefined = process.env.API_ROOT_URL;
const API_KEY: string | undefined = process.env.API_KEY;
const CACHE_TTL_MINUTES = 60;

export class SearchService {

    async search(data: { query: string; page?: number }): Promise<any> {
        const {query, page = 1} = data;

        if (isEmptyString(query)) {
            throw new BadRequest('Query cannot be empty');
        }

        const search_URL: string =
            `${URL}?method=album.search` +
            `&album=${encodeURIComponent(query)}` +
            `&api_key=${API_KEY}` +
            `&page=${page}` +
            `&format=json`;

        const response: Response = await fetch(search_URL);
        const searchResults: any = await response.json();

        if (searchResults.error) {
            throw new NotFound(searchResults.message || 'No results found');
        }

        const albums = searchResults.results.albummatches.album;

        // Stocker chaque album individuellement
        await Promise.all(
            albums.map((album: any) => {
                const api_id = album.mbid
                    ? `album:${album.mbid}`
                    : `album:${album.artist}:${album.name}`;

                const content = {
                    name: album.name,
                    artist: album.artist,
                    url: album.url,
                    image: album.image,
                    mbid: album.mbid,
                };

                return PrismaDb.medias.upsert({
                    where: { api_id },
                    update: {
                        content,
                        expires_at: new Date(Date.now() + CACHE_TTL_MINUTES * 60 * 1000),
                    },
                    create: {
                        api_id,
                        content,
                        expires_at: new Date(Date.now() + CACHE_TTL_MINUTES * 60 * 1000),
                    },
                });
            })
        );

        return searchResults;
    }
}

export const searchService = new SearchService();