import {searchController} from '../../modules/external_api/search.controller.js';
import express, {NextFunction, Request, Response, Router} from 'express';

var router: Router = express.Router();

router.get('/', function (req: Request, res: Response, next: NextFunction): void {
    searchController.search(req, res, next);
});

export default router;