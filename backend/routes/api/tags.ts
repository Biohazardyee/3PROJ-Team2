import tagController from "../../modules/external_api/tags/tag.controller.js";
import express from 'express';

var router = express.Router();

router.get('/info', function (req, res, next) {
    tagController.getTagInfo(req, res, next);
});

router.get('/info/top-albums', function (req, res, next) {
    tagController.getTagTopAlbums(req, res, next);
});

router.get('/info/top-artists', function (req, res, next) {
    tagController.getTagTopArtists(req, res, next);
});

router.get('/info/top-tracks', function (req, res, next) {
    tagController.getTagTopTracks(req, res, next);
});

router.get('/info/similar-tags/', function (req, res, next) {
    tagController.getSimilarTags(req, res, next);
});


export default router;