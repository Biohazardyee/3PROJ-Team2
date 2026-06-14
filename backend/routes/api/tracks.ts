import {trackController} from "../../modules/external_api/tracks/track.controller.js";
import express, {NextFunction, Router} from 'express';

var router: Router = express.Router();

router.get('/info', function (req, res, next: NextFunction): void {
    trackController.getTrackInfo(req, res, next);
});

router.get('/info/top-tags', function (req, res, next: NextFunction): void {
    trackController.getTopTrackTags(req, res, next);
});

router.get('/info/similar-tracks', function (req, res, next: NextFunction): void {
    trackController.getSimilarTracks(req, res, next);
});

export default router;
