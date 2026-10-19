
import express from "express";
import {
  createBooking,
  getMyBookings,
  getBookingHistory,
  cancelBooking,
  getAllBookings,
  updateBookingStatus,
} from "../controllers/bookingController.js";

import {
  protect,
  adminOnly,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Customer booking routes
router.post("/", protect, createBooking);
router.get("/my", protect, getMyBookings);
router.get("/history", protect, getBookingHistory);
router.patch("/:id/cancel", protect, cancelBooking);

// Admin booking routes
router.get("/admin/all", protect, adminOnly, getAllBookings);
router.patch(
  "/admin/:id/status",
  protect,
  adminOnly,
  updateBookingStatus
);

export default router;
