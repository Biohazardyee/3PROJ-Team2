import express from 'express';
import userController from '../../modules/db/users/user.controller.js';
import { authGuard } from "../../middlewares/auth.js";
import {checkAdminOrSelf} from "../../middlewares/checkAdminOrSelf.js";
import {checkAdmin} from "../../middlewares/checkAdmin.js";

var router = express.Router();

router.post('/signin', function(req, res, next) {
  userController.add(req, res, next);
});

router.post('/login', function(req, res, next) {
  userController.login(req, res, next);
});

router.put('/:id', authGuard, checkAdminOrSelf, function(req, res, next) {
  userController.update(req, res, next);
});

router.delete('/:id', authGuard, checkAdminOrSelf, function(req, res, next) {
  userController.delete(req, res, next);
});

router.get('/', authGuard, checkAdmin, function(req, res, next) {
  userController.getAll(req, res, next);
});

router.get('/:id', authGuard, checkAdminOrSelf, function(req, res, next) {
  userController.getById(req, res, next);
});


export default router;
