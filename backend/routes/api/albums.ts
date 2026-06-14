import albumController from "../../modules/external_api/albums/album.controller.js";
import express, {NextFunction, Router} from 'express';

var router: Router = express.Router();

router.get('/info', function (req, res, next: NextFunction): void {
    albumController.getAlbumInfo(req, res, next);
});

router.get('/info/tags/:mbid', function (req, res, next: NextFunction): void {
    albumController.albumGetTags(req, res, next);
});

router.get('/similar', function (req, res, next: NextFunction): void {
    albumController.albumGetSimilar(req, res, next)
});


export default router;