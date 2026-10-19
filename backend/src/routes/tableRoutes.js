
import express from "express";
import {
  getTables,
  createTable,
  updateTable,
  deleteTable,
  checkAvailability
} from "../controllers/tableController.js";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.get("/restaurant/:restaurantId", getTables);
router.get("/restaurant/:restaurantId/availability", checkAvailability);

router.post("/restaurant/:restaurantId", protect, adminOnly, createTable);
router.patch("/:id", protect, adminOnly, updateTable);
router.delete("/:id", protect, adminOnly, deleteTable);

export default router;
