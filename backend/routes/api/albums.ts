import albumController from "../../modules/external_api/albums/album.controller.js";
import express from 'express';

var router = express.Router();

router.get('/info', function (req, res, next) {
    albumController.getAlbumInfo(req, res, next);
});

router.get('/info/:mbid', function (req, res, next) {
    albumController.getAlbumInfoById(req, res, next);
});

router.get('/info/tags', function (req, res, next) {
    albumController.albumGetTags(req, res, next);
});



export default router;