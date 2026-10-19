
import bcrypt from "bcryptjs";
import crypto from "crypto";
import User from "../models/userModel.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  signAuthToken,
  setAuthCookie,
  clearAuthCookie
} from "../utils/generateToken.js";

const publicUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  createdAt: user.createdAt
});

export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!name?.trim() || !email?.trim() || !password) {
    return res.status(400).json({
      success: false,
      message: "Name, email and password are required."
    });
  }

  if (password.length < 8) {
    return res.status(400).json({
      success: false,
      message: "Password must contain at least 8 characters."
    });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    return res.status(409).json({
      success: false,
      message: "An account with this email already exists. Please log in."
    });
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password: hashedPassword,
    phone: phone?.trim() || "",
    role: "user"
  });

  const token = signAuthToken(user);
  setAuthCookie(res, token);

  res.status(201).json({
    success: true,
    message: "Registration successful.",
    user: publicUser(user)
  });
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required."
    });
  }

  const user = await User.findOne({
    email: email.trim().toLowerCase()
  }).select("+password");

  const passwordMatches = user
    ? await bcrypt.compare(password, user.password)
    : false;

  if (!user || !passwordMatches) {
    return res.status(401).json({
      success: false,
      message: "Invalid email or password."
    });
  }

  if (!user.isActive) {
    return res.status(403).json({
      success: false,
      message: "This account is inactive."
    });
  }

  if (user.role !== "user") {
    return res.status(403).json({
      success: false,
      message: "Please use the admin login page."
    });
  }

  setAuthCookie(res, signAuthToken(user));

  res.json({
    success: true,
    message: "Login successful.",
    user: publicUser(user)
  });
});

export const getMe = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    user: publicUser(req.user)
  });
});

export const logoutUser = asyncHandler(async (req, res) => {
  clearAuthCookie(res);

  res.json({
    success: true,
    message: "Logged out successfully."
  });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, password } = req.body;

  if (name !== undefined) {
    if (!name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name cannot be empty."
      });
    }

    req.user.name = name.trim();
  }

  if (phone !== undefined) {
    req.user.phone = phone.trim();
  }

  if (password !== undefined) {
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must contain at least 8 characters."
      });
    }

    req.user.password = await bcrypt.hash(password, 12);
  }

  await req.user.save();

  res.json({
    success: true,
    message: "Profile updated successfully.",
    user: publicUser(req.user)
  });
});

export const setupAdmin = asyncHandler(async (req, res) => {
  const setupKey = req.get("x-admin-setup-key");

  if (
    !process.env.ADMIN_SETUP_KEY ||
    setupKey !== process.env.ADMIN_SETUP_KEY
  ) {
    return res.status(403).json({
      success: false,
      message: "Invalid admin setup key."
    });
  }

  const adminExists = await User.exists({ role: "admin" });

  if (adminExists) {
    return res.status(409).json({
      success: false,
      message: "An admin account already exists."
    });
  }

  const { name, email, password, phone } = req.body;

  if (!name?.trim() || !email?.trim() || !password || password.length < 8) {
    return res.status(400).json({
      success: false,
      message: "Enter a name, valid email and password of at least 8 characters."
    });
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (await User.exists({ email: normalizedEmail })) {
    return res.status(409).json({
      success: false,
      message: "An account with this email already exists."
    });
  }

  const admin = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password: await bcrypt.hash(password, 12),
    phone: phone?.trim() || "",
    role: "admin"
  });

  res.status(201).json({
    success: true,
    message: "Admin account created. You can now use admin login.",
    user: publicUser(admin)
  });
});

export const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required."
    });
  }

  const admin = await User.findOne({
    email: email.trim().toLowerCase(),
    role: "admin"
  }).select("+password");

  if (!admin || !(await bcrypt.compare(password, admin.password))) {
    return res.status(401).json({
      success: false,
      message: "Invalid admin email or password."
    });
  }

  if (!admin.isActive) {
    return res.status(403).json({
      success: false,
      message: "This admin account is inactive."
    });
  }

  setAuthCookie(res, signAuthToken(admin));

  res.json({
    success: true,
    message: "Admin login successful.",
    user: publicUser(admin)
  });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email?.trim()) {
    return res.status(400).json({
      success: false,
      message: "Please enter your email."
    });
  }

  const user = await User.findOne({
    email: email.trim().toLowerCase()
  }).select("+resetPasswordToken +resetPasswordExpires");

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "No account found with this email."
    });
  }

  const resetToken = crypto.randomBytes(32).toString("hex");

  user.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);

  await user.save();

  res.json({
    success: true,
    message: "Demo reset token generated.",
    resetToken
  });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password, confirmPassword } = req.body;

  if (!password || !confirmPassword) {
    return res.status(400).json({
      success: false,
      message: "Enter and confirm your new password."
    });
  }

  if (password.length < 8) {
    return res.status(400).json({
      success: false,
      message: "Password must contain at least 8 characters."
    });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({
      success: false,
      message: "Passwords do not match."
    });
  }

  const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: new Date() }
  }).select("+resetPasswordToken +resetPasswordExpires +password");

  if (!user) {
    return res.status(400).json({
      success: false,
      message: "Reset token is invalid or expired."
    });
  }

  user.password = await bcrypt.hash(password, 12);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  await user.save();

  res.json({
    success: true,
    message: "Password reset successfully. Please log in."
  });
});
