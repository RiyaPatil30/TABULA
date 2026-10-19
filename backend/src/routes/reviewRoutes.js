import express from "express";
import {
  getRestaurantReviews,
  addOrUpdateReview,
  deleteMyReview
} from "../controllers/reviewController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/restaurant/:restaurantId", getRestaurantReviews);
router.put("/restaurant/:restaurantId", protect, addOrUpdateReview);
router.delete("/:id", protect, deleteMyReview);

export default router;
