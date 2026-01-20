import { trackController } from "../../modules/external_api/tracks/track.controller.js";
import express from 'express';

var router = express.Router();

router.get('/info', function (req, res, next) {
    trackController.getTrackInfo(req, res, next);
});

router.get('/info/top-tags', function (req, res, next) {
    trackController.getTopTrackTags(req, res, next);
});

router.get('/info/similar-tracks', function (req, res, next) {
    trackController.getSimilarTracks(req, res, next);
});

export default router;
