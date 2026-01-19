import { Router } from "express";
import reportController from "../modules/db/reports/report.controller.js";

const router = Router();

// Create report
router.post("/", reportController.add);

// Admin routes
router.get("/", reportController.getAll);
router.get("/:id", reportController.getById);
router.get("/review/:review_id", reportController.getByReview);

// Mark report as checked
router.patch("/:id/check", reportController.update);

// Delete report
router.delete("/:id", reportController.delete);

export default router;
