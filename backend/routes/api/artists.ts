import {artistController} from '../../modules/external_api/artists/artist.controller.js';
import express, {NextFunction, Router} from 'express';

var router: Router = express.Router();

router.get('/info', function (req, res, next: NextFunction): void {
    artistController.getArtistInfo(req, res, next);
});

router.get('/info/top-albums', function (req, res, next: NextFunction): void {
    artistController.getTopAlbums(req, res, next);
});

router.get('/info/top-tags', function (req, res, next: NextFunction): void {
    artistController.getArtistTopTags(req, res, next);
});

router.get('/info/top-tracks', function (req, res, next: NextFunction): void {
    artistController.getArtistTopTracks(req, res, next);
});

router.get('/info/:mbid', function (req, res, next: NextFunction): void {
    artistController.getArtistbyId(req, res, next);
});

router.get('/info/similar-artists/:mbid', function (req, res, next: NextFunction): void {
    artistController.getSimilarArtists(req, res, next);
});

export default router;