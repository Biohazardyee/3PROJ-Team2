import { Router } from 'express';
import notificationController from '../modules/db/notifications/notification.controller.js';

const router = Router();

router.post('/', notificationController.add);

router.get('/', notificationController.getAll);

router.get('/:id', notificationController.getById);

router.get('/user/:user_id', notificationController.getByUser);

router.patch('/:id/read', notificationController.update);

router.delete('/:id', notificationController.delete);

export default router;
