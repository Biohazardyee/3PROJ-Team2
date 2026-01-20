import { artistController } from '../../modules/external_api/artists/artist.controller.js';
import express from 'express';

var router = express.Router();

router.get('/info', function (req, res, next) {
    artistController.getArtistInfo(req, res, next);
});

router.get('/info/top-albums', function (req, res, next) {
    artistController.getTopAlbums(req, res, next);
});

router.get('/info/top-tags', function (req, res, next) {
    artistController.getArtistTopTags(req, res, next);
});

router.get('/info/top-tracks', function (req, res, next) {
    artistController.getArtistTopTracks(req, res, next);
});

router.get('/info/:mbid', function (req, res, next) {
    artistController.getArtistbyId(req, res, next);
});

router.get('/info/similar-artists/:mbid', function (req, res, next) {
    artistController.getSimilarArtists(req, res, next);
});

export default router;