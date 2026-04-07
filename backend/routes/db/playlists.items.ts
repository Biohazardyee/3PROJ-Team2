import { NextFunction, Request, Response, Router } from "express";
import playlistItemController from "../../modules/db/playlists/playlist.item.controller.js";
import { authGuard } from "../../middlewares/auth.js";
import { checkAdmin } from "../../middlewares/checkAdmin.js";

const router: Router = Router();


router.post("/", authGuard, (req, res, next) => {
  playlistItemController.add(req, res, next);
});


router.get("/", authGuard, checkAdmin, (req, res, next) => {
  playlistItemController.getAll(req, res, next);
});


router.get("/item/:id", authGuard, (req, res, next) => {
  playlistItemController.getById(req, res, next);
});


router.get("/playlist/:playlist_id", authGuard, (req, res, next) => {
  playlistItemController.getByPlaylistId(req, res, next);
});


router.delete("/:id", authGuard, (req, res, next) => {
  playlistItemController.delete(req, res, next);
});

export default router;
