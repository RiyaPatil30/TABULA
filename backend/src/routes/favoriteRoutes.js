
import express from "express";
import {
  getFavorites,
  addFavorite,
  removeFavorite
} from "../controllers/favoriteController.js";
import { protect } from "../middleware/authMiddleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = express.Router();

router.use(protect);

router.get("/", asyncHandler(getFavorites));
router.post("/:restaurantId", asyncHandler(addFavorite));
router.delete("/:restaurantId", asyncHandler(removeFavorite));

export default router;
