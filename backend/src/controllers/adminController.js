
import User from "../models/userModel.js";
import Restaurant from "../models/restaurantModel.js";
import Table from "../models/tableModel.js";
import Booking from "../models/bookingModel.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getDashboardStats = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalRestaurants,
    totalTables,
    totalBookings,
    pendingBookings,
    confirmedBookings,
    completedBookings,
    cancelledBookings
  ] = await Promise.all([
    User.countDocuments({ role: "user" }),
    Restaurant.countDocuments({ isActive: true }),
    Table.countDocuments({ isActive: true }),
    Booking.countDocuments(),
    Booking.countDocuments({ status: "pending" }),
    Booking.countDocuments({ status: "confirmed" }),
    Booking.countDocuments({ status: "completed" }),
    Booking.countDocuments({ status: "cancelled" })
  ]);

  res.json({
    success: true,
    stats: {
      totalUsers,
      totalRestaurants,
      totalTables,
      totalBookings,
      pendingBookings,
      confirmedBookings,
      completedBookings,
      cancelledBookings
    }
  });
});

export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ role: "user" })
    .select("-password")
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: users.length,
    users
  });
});

export const updateUserStatus = asyncHandler(async (req, res) => {
  const { isActive } = req.body;

  if (typeof isActive !== "boolean") {
    return res.status(400).json({
      success: false,
      message: "isActive must be true or false."
    });
  }

  const user = await User.findOne({
    _id: req.params.id,
    role: "user"
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "Normal user account not found."
    });
  }

  user.isActive = isActive;
  await user.save();

  res.json({
    success: true,
    message: isActive ? "User account activated." : "User account deactivated.",
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      isActive: user.isActive
    }
  });
});
