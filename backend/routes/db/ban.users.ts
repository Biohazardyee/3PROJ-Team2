import express, { NextFunction, Router } from 'express';
import userBanController from '../../modules/db/users/ban.user.controller.js';
import { checkAdmin } from "../../middlewares/checkAdmin.js";
import { authGuard } from "../../middlewares/auth.js";

var router: Router = express.Router();

router.post('/', authGuard, checkAdmin, function (req, res, next: NextFunction): void {
    userBanController.add(req, res, next);
});

router.get('/', authGuard, checkAdmin, function (req, res, next: NextFunction): void {
    userBanController.getAll(req, res, next);
});

router.get('/:user_id', authGuard, checkAdmin, function (req, res, next: NextFunction): void {
    userBanController.getById(req, res, next);
});

router.put('/:id', authGuard, checkAdmin, function (req, res, next: NextFunction): void {
    userBanController.update(req, res, next);
});

router.delete('/:id', authGuard, checkAdmin, function (req, res, next) {
    userBanController.delete(req, res, next);
})

export default router;
