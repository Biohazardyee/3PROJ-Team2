import messageController from "../../modules/db/messages/message.controller.js";
import express from "express";

const router = express.Router();

router.get('/', function(req, res, next){
    messageController.getAll(req, res, next);
})

router.post('/', function(req, res, next){
    messageController.add(req, res, next);
})

router.get('/:id', function(req, res, next){
    messageController.getById(req, res, next);
})

router.put('/:id', function(req, res, next){
    messageController.update(req, res, next);
})

router.delete('/:id', function(req, res, next){
    messageController.delete(req, res, next);
})

export default router;