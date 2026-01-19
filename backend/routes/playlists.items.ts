import { Router } from 'express';
import playlistItemController from '../modules/db/playlists/playlist.item.controller.js';

const router = Router();

// Add media to playlist
router.post('/', playlistItemController.add);

router.get('/', playlistItemController.getAll);

router.get('/:id', playlistItemController.getById);

// Get items from a playlist
router.get('/:playlist_id', playlistItemController.getByPlaylistId);

// Remove item
router.delete('/:id', playlistItemController.delete);

export default router;
