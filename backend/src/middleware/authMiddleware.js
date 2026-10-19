
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Protect routes that require login.
export const protect = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.tabula_token;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Please log in to continue.",
    });
  }

  let decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({
      success: false,
      message: "Session expired. Please log in again.",
    });
  }

  const user = await User.findById(decoded.id);

  if (!user || !user.isActive) {
    return res.status(401).json({
      success: false,
      message: "User account not found or inactive.",
    });
  }

  req.user = user;
  next();
});

// Allow access only to admins.
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: "Access denied. Admin only.",
  });
};

// Optional login: public routes remain accessible without login.
export const optionalAuth = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.tabula_token;

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (user && user.isActive) {
      req.user = user;
    }
  } catch {
    // Continue without authentication for public routes.
  }

  next();
});
