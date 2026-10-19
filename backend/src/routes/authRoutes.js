
import express from "express";
import {
  registerUser,
  loginUser,
  getMe,
  logoutUser,
  updateProfile,
  setupAdmin,
  loginAdmin,
  forgotPassword,
  resetPassword
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.get("/me", protect, getMe);
router.post("/logout", logoutUser);
router.patch("/profile", protect, updateProfile);
router.post("/admin/setup", setupAdmin);
router.post("/admin/login", loginAdmin);

export default router;
