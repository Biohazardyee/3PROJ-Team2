import { Request, Response, NextFunction } from 'express';
import { BadRequest } from '../../utils/errors.js';
import { searchService } from './search.service.js';

class SearchController {

    async search(req: Request, res: Response, next: NextFunction) {
        try {
            const { query } = req.query;

            if (!query) {
                throw new BadRequest('Query is required');
            }

            const searchResults = await searchService.search({
                query: String(query),
            });
            res.status(200).json({
                message: 'Search completed successfully',
                searchResults,
            });
        }
        catch (err) {
            next(err);
        }
    }
}

export const searchController = new SearchController();