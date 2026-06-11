import {NextFunction, Request, Response, Router} from "express";
import playlistItemController from "../../modules/db/playlists/playlist.item.controller.js";
import {authGuard} from "../../middlewares/auth.js";
import {checkAdmin} from "../../middlewares/checkAdmin.js";
import {checkPlaylistOwner} from "../../middlewares/checkPlaylistOwner.js";

const router: Router = Router();


router.post("/", authGuard, (req, res, next: NextFunction): void => {
    playlistItemController.add(req, res, next);
});


router.get("/", authGuard, checkAdmin, (req, res, next: NextFunction): void => {
    playlistItemController.getAll(req, res, next);
});


router.get("/item/:id", authGuard, (req, res, next: NextFunction): void => {
    playlistItemController.getById(req, res, next);
});


router.get("/playlist/:playlist_id", authGuard, (req, res, next: NextFunction): void => {
    playlistItemController.getByPlaylistId(req, res, next);
});


router.delete("/:id", authGuard, checkPlaylistOwner, (req, res, next: NextFunction): void => {
    playlistItemController.delete(req, res, next);
});

export default router;
