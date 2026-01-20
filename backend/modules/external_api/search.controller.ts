import { Request, Response, NextFunction } from 'express';
import { BadRequest } from '../../utils/errors.js';
import { searchService } from './search.service.js';

class SearchController {

    async search(req: Request, res: Response, next: NextFunction) {
        try {
            const { album } = req.query;

            if (!album) {
                throw new BadRequest('Album is required');
            }

            const searchResults = await searchService.search({
                query: String(album),
            });
            res.status(200).json({
                message: 'Album search completed successfully',
                searchResults,
            });
        }
        catch (err) {
            next(err);
        }
    }
}

export const searchController = new SearchController();