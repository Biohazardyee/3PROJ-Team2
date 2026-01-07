import express from 'express';
import userController from '../modules/users/user.controller.js';


var router = express.Router();


router.post('/signin', function(req, res, next) {
  userController.add(req, res, next);
});

router.post('/login', function(req, res, next) {
  userController.login(req, res, next);
});


router.put('/:id', function(req, res, next) {
  userController.update(req, res, next);
});

router.delete('/:id', function(req, res, next) {
  userController.delete(req, res, next);
});

router.get('/', function(req, res, next) {
  userController.getAll(req, res, next);
});

router.get('/:id', function(req, res, next) {
  userController.getById(req, res, next);
});


export default router;
