
import express from "express";
import {
  getRestaurants,
  getRestaurantById,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  getRecentlyViewed
} from "../controllers/restaurantController.js";

import {
  protect,
  optionalAuth
} from "../middleware/authMiddleware.js";

import { adminOnly } from "../middleware/adminMiddleware.js";

const router = express.Router();

// Public restaurant routes
router.get("/", getRestaurants);
router.get("/recently-viewed", protect, getRecentlyViewed);
router.get("/:id", optionalAuth, getRestaurantById);

// Admin restaurant management
router.post("/", protect, adminOnly, createRestaurant);
router.patch("/:id", protect, adminOnly, updateRestaurant);
router.delete("/:id", protect, adminOnly, deleteRestaurant);

export default router;
