
import express from "express";
import {
  getDashboardStats,
  getAllUsers,
  updateUserStatus
} from "../controllers/adminController.js";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.use(protect, adminOnly);

router.get("/dashboard", getDashboardStats);
router.get("/users", getAllUsers);
router.patch("/users/:id/status", updateUserStatus);

export default router;
