import express, {NextFunction, Router} from 'express';
import userBanController from '../../modules/db/users/ban.user.controller.js';

var router: Router = express.Router();

router.post('/', function (req, res, next: NextFunction): void {
    userBanController.add(req, res, next);
});

router.get('/', function (req, res, next: NextFunction): void {
    userBanController.getAll(req, res, next);
});

router.get('/:user_id', function (req, res, next: NextFunction): void {
    userBanController.getById(req, res, next);
});

router.put('/:id', function (req, res, next: NextFunction): void {
    userBanController.update(req, res, next);
});

router.delete('/:id', function (req, res, next) {
    userBanController.delete(req, res, next);
})

export default router;
