import express, {NextFunction, Router} from "express";
import conversationController from "../../modules/db/conversations/conversation.controller.js";
import messageController from "../../modules/db/messages/message.controller.js";

var router: Router = express.Router();

router.get("/", function (req, res, next: NextFunction): void {
    messageController.getAll(req, res, next);
})

router.get("/:id", function (req, res, next: NextFunction): void {
    messageController.getById(req, res, next);
})

router.post("/", function (req, res, next: NextFunction): void {
    messageController.add(req, res, next);
})

router.delete("/:id", function (req, res, next: NextFunction): void {
    messageController.delete(req, res, next);
})

export default router;