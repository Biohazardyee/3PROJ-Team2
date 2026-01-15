import { Router } from 'express';
import followController from '../modules/follows/follow.controller.js';

const router = Router();

router.post('/', followController.create);

router.delete('/', followController.delete);

router.get('/followers/:user_id', followController.getFollowers);

router.get('/following/:user_id', followController.getFollowing);

export default router;
