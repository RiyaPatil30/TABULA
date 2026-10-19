
import express from "express";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification
} from "../controllers/notificationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getNotifications);
router.patch("/read-all", protect, markAllNotificationsRead);
router.patch("/:id/read", protect, markNotificationRead);
router.delete("/:id", protect, deleteNotification);

export default router;
