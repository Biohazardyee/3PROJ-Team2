import tagController from "../../modules/external_api/tags/tag.controller.js";
import express, {NextFunction, Router} from 'express';

var router: Router = express.Router();

router.get('/info', function (req, res, next: NextFunction): void {
    tagController.getTagInfo(req, res, next);
});

router.get('/info/top-albums', function (req, res, next: NextFunction): void {
    tagController.getTagTopAlbums(req, res, next);
});

router.get('/info/top-artists', function (req, res, next: NextFunction): void {
    tagController.getTagTopArtists(req, res, next);
});

router.get('/info/top-tracks', function (req, res, next: NextFunction): void {
    tagController.getTagTopTracks(req, res, next);
});

router.get('/info/similar-tags/', function (req, res, next: NextFunction): void {
    tagController.getSimilarTags(req, res, next);
});


export default router;