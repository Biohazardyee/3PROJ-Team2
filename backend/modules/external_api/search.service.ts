
import dotenv from 'dotenv';
import { BadRequest, NotFound } from "../../utils/errors.js";
import { isEmptyString } from '../../utils/helpers.js';

dotenv.config();

const URL = process.env.API_ROOT_URL;
const API_KEY = process.env.API_KEY;


// We use a single search service, as all the searches could be handled here.
// The way it is handled is that it checks for artist, album, track, etc.
// Making it once instead of multiple services for each type of search.
// It still uses the method=album.search but still looks for artist, track, etc.

export class SearchService {

    async search(data: { query: string }) {

        const { query } = data;

        if (isEmptyString(query)) {
            throw new BadRequest('Query cannot be empty');
        }

        const search_URL =
            `${URL}?method=album.search` +
            `&album=${encodeURIComponent(query)}` +
            `&api_key=${API_KEY}` +
            `&format=json`;

        const response = await fetch(search_URL);

        const searchResults = await response.json();

        if (searchResults.error) {
            throw new NotFound(searchResults.message || 'No results found');
        }
        return searchResults;
    }
}



export const searchService = new SearchService();