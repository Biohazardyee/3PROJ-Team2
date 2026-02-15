import { Router } from 'express';
import activityController from '../../modules/db/activities/activity.controller.js';

const router: Router = Router();

router.post('/', activityController.add);

router.get('/', activityController.getAll);

router.get('/:id', activityController.getById);

// router.get('/feed/:user_id', activityController.getFeed);

router.delete('/:id', activityController.delete);

export default router;
