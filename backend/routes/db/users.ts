import express, {NextFunction, Router} from 'express';
import userController from '../../modules/db/users/user.controller.js';
import {authGuard} from "../../middlewares/auth.js";
import {checkAdminOrSelf} from "../../middlewares/checkAdminOrSelf.js";
import {checkAdmin} from "../../middlewares/checkAdmin.js";

var router: Router = express.Router();

router.post('/signin', function (req, res, next: NextFunction): void {
    userController.add(req, res, next);
});

router.post('/login', function (req, res, next: NextFunction): void {
    userController.login(req, res, next);
});

router.put('/:id', authGuard, checkAdminOrSelf, function (req, res, next: NextFunction): void {
    userController.update(req, res, next);
});

router.delete('/:id', authGuard, checkAdminOrSelf, function (req, res, next: NextFunction): void {
    userController.delete(req, res, next);
});

router.get('/', authGuard, checkAdmin, function (req, res, next: NextFunction): void {
    userController.getAll(req, res, next);
});

router.get('/:id', authGuard, checkAdminOrSelf, function (req, res, next: NextFunction): void {
    userController.getById(req, res, next);
});


export default router;
