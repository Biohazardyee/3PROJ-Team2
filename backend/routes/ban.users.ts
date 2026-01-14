import express from 'express';
import userBanController from '../modules/users/ban.user.controller.js';

var router = express.Router();

router.post('/', function(req, res, next) {
  userBanController.add(req, res, next);
});

router.get('/', function(req, res, next) {
  userBanController.getAll(req, res, next);
});

router.get('/:user_id', function(req, res, next) {
  userBanController.getById(req, res, next);
});

router.put('/:id', function(req, res, next) {
  userBanController.update(req, res, next);
});

export default router;
