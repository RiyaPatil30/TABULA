
import mongoose from "mongoose";
import Booking from "../models/bookingModel.js";
import Restaurant from "../models/restaurantModel.js";
import Table from "../models/tableModel.js";
import Notification from "../models/notificationModel.js";
import User from "../models/userModel.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

const sendNotification = async (user, title, message, type = "booking") => {
  await Notification.create({ user, title, message, type });
};

const bookingPopulate = [
  { path: "restaurant", select: "name address imageUrl cuisine" },
  { path: "table", select: "tableNumber capacity location" }
];

const getTodayIST = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());

// Booking date is stored as UTC midnight; booking time is in IST.
const getBookingEndDateTime = (booking) => {
  if (!booking?.bookingDate || !timePattern.test(booking.endTime || "")) {
    return new Date(NaN);
  }

  const bookingDate = new Date(booking.bookingDate);

  if (Number.isNaN(bookingDate.getTime())) {
    return new Date(NaN);
  }

  const date = bookingDate.toISOString().slice(0, 10);
  return new Date(`${date}T${booking.endTime}:00+05:30`);
};

// Only expired confirmed bookings become completed.
const updateExpiredBookings = async (userId = null) => {
  const filter = { status: "confirmed" };

  if (userId) {
    filter.user = userId;
  }

  const bookings = await Booking.find(filter);
  const now = Date.now();
  let completedCount = 0;

  for (const booking of bookings) {
    const bookingEnd = getBookingEndDateTime(booking);

    if (
      !Number.isNaN(bookingEnd.getTime()) &&
      bookingEnd.getTime() <= now
    ) {
      // Update only if the booking is still confirmed.
      const updatedBooking = await Booking.findOneAndUpdate(
        { _id: booking._id, status: "confirmed" },
        { $set: { status: "completed" } },
        { returnDocument: "after" }
      );

      if (!updatedBooking) continue;

      completedCount++;

      try {
        await sendNotification(
          updatedBooking.user,
          "Booking completed",
          "Your restaurant booking has been marked as completed."
        );
      } catch (error) {
        console.error("Completion notification failed:", error.message);
      }
    }
  }

  return completedCount;
};

const createBooking = asyncHandler(async (req, res) => {
  const {
    restaurantId,
    tableId,
    date,
    startTime,
    endTime,
    guests,
    specialRequests
  } = req.body;

  if (
    !restaurantId ||
    !tableId ||
    !date ||
    !startTime ||
    !endTime ||
    guests === undefined
  ) {
    return res.status(400).json({
      success: false,
      message: "Restaurant, table, date, times and guest count are required."
    });
  }

  if (
    !mongoose.isValidObjectId(restaurantId) ||
    !mongoose.isValidObjectId(tableId)
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid restaurant or table ID."
    });
  }

  if (
    !timePattern.test(startTime) ||
    !timePattern.test(endTime) ||
    startTime >= endTime
  ) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid start and end time."
    });
  }

  const guestCount = Number(guests);

  if (!Number.isInteger(guestCount) || guestCount < 1 || guestCount > 20) {
    return res.status(400).json({
      success: false,
      message: "Guest count must be between 1 and 20."
    });
  }

  const validDateFormat =
    typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date);

  const bookingDate = validDateFormat
    ? new Date(`${date}T00:00:00.000Z`)
    : new Date(NaN);

  if (
    !validDateFormat ||
    Number.isNaN(bookingDate.getTime()) ||
    bookingDate.toISOString().slice(0, 10) !== date
  ) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid booking date."
    });
  }

  if (date < getTodayIST()) {
    return res.status(400).json({
      success: false,
      message: "Bookings cannot be made for a past date."
    });
  }

  const restaurant = await Restaurant.findOne({
    _id: restaurantId,
    isActive: true
  });

  if (!restaurant) {
    return res.status(404).json({
      success: false,
      message: "Active restaurant not found."
    });
  }

  const table = await Table.findOne({
    _id: tableId,
    restaurant: restaurant._id,
    isActive: true
  });

  if (!table) {
    return res.status(404).json({
      success: false,
      message: "Selected table was not found or is unavailable."
    });
  }

  if (table.capacity < guestCount) {
    return res.status(400).json({
      success: false,
      message: "Selected table cannot accommodate all guests."
    });
  }

  const dayEnd = new Date(bookingDate);
  dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);

  const conflictingBooking = await Booking.findOne({
    restaurant: restaurant._id,
    table: table._id,
    bookingDate: { $gte: bookingDate, $lt: dayEnd },
    status: { $in: ["pending", "confirmed"] },
    startTime: { $lt: endTime },
    endTime: { $gt: startTime }
  });

  if (conflictingBooking) {
    return res.status(409).json({
      success: false,
      message: "This table is no longer available. Please check availability again."
    });
  }

  const booking = await Booking.create({
    user: req.user._id,
    restaurant: restaurant._id,
    table: table._id,
    bookingDate,
    startTime,
    endTime,
    guests: guestCount,
    specialRequests: specialRequests || "",
    status: "pending"
  });

  await sendNotification(
    req.user._id,
    "Booking request submitted",
    `Your booking at ${restaurant.name}, table ${table.tableNumber}, has been submitted and is awaiting approval.`
  );

  const admins = await User.find({
    role: "admin",
    isActive: true
  }).select("_id");

  await Promise.all(
    admins.map((admin) =>
      sendNotification(
        admin._id,
        "New Booking Request",
        `A new booking request has been received for ${restaurant.name}, table ${table.tableNumber}.`
      )
    )
  );

  const populatedBooking = await Booking.findById(booking._id)
    .populate(bookingPopulate);

  res.status(201).json({
    success: true,
    message: "Booking request submitted successfully.",
    booking: populatedBooking
  });
});

const getMyBookings = asyncHandler(async (req, res) => {
  await updateExpiredBookings(req.user._id);

  const bookings = await Booking.find({
    user: req.user._id,
    status: { $in: ["pending", "confirmed"] }
  })
    .populate(bookingPopulate)
    .sort({ bookingDate: 1, startTime: 1 });

  res.json({ success: true, bookings });
});

const getBookingHistory = asyncHandler(async (req, res) => {
  await updateExpiredBookings(req.user._id);

  const bookings = await Booking.find({
    user: req.user._id,
    status: { $in: ["completed", "cancelled", "rejected"] }
  })
    .populate(bookingPopulate)
    .sort({ bookingDate: -1, startTime: -1 });

  res.json({ success: true, bookings });
});

const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findOne({
    _id: req.params.id,
    user: req.user._id
  }).populate("restaurant", "name");

  if (!booking) {
    return res.status(404).json({
      success: false,
      message: "Booking not found."
    });
  }

  if (!["pending", "confirmed"].includes(booking.status)) {
    return res.status(400).json({
      success: false,
      message: "This booking cannot be cancelled."
    });
  }

  booking.status = "cancelled";
  booking.cancellationReason =
    typeof req.body?.reason === "string" ? req.body.reason.trim() : "";

  await booking.save();

  await sendNotification(
    req.user._id,
    "Booking cancelled",
    `Your booking at ${booking.restaurant?.name || "the restaurant"} has been cancelled.`
  );

  res.json({
    success: true,
    message: "Booking cancelled successfully.",
    booking
  });
});

const getAllBookings = asyncHandler(async (req, res) => {
  await updateExpiredBookings();

  const filter = {};

  if (req.query.status) {
    const allowedStatuses = [
      "pending",
      "confirmed",
      "rejected",
      "cancelled",
      "completed"
    ];

    if (!allowedStatuses.includes(req.query.status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking status."
      });
    }

    filter.status = req.query.status;
  }

  const bookings = await Booking.find(filter)
    .populate("user", "name email phone")
    .populate(bookingPopulate)
    .sort({ createdAt: -1 });

  res.json({ success: true, bookings });
});

const updateBookingStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const allowedStatuses = ["confirmed", "rejected", "completed"];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Status must be confirmed, rejected or completed."
    });
  }

  const booking = await Booking.findById(req.params.id)
    .populate("restaurant", "name");

  if (!booking) {
    return res.status(404).json({
      success: false,
      message: "Booking not found."
    });
  }

  if (
    ["confirmed", "rejected"].includes(status) &&
    booking.status !== "pending"
  ) {
    return res.status(400).json({
      success: false,
      message: "Only pending bookings can be approved or rejected."
    });
  }

  if (status === "completed") {
    if (booking.status !== "confirmed") {
      return res.status(400).json({
        success: false,
        message: "Only confirmed bookings can be completed."
      });
    }

    const bookingEnd = getBookingEndDateTime(booking);

    if (
      Number.isNaN(bookingEnd.getTime()) ||
      bookingEnd.getTime() > Date.now()
    ) {
      return res.status(400).json({
        success: false,
        message: "A booking can be completed only after its end time."
      });
    }
  }

  if (status === "confirmed" && booking.table) {
    const dayStart = new Date(booking.bookingDate);
    dayStart.setUTCHours(0, 0, 0, 0);

    const dayEnd = new Date(dayStart);
    dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);

    const conflict = await Booking.findOne({
      _id: { $ne: booking._id },
      table: booking.table._id || booking.table,
      bookingDate: { $gte: dayStart, $lt: dayEnd },
      status: { $in: ["pending", "confirmed"] },
      startTime: { $lt: booking.endTime },
      endTime: { $gt: booking.startTime }
    });

    if (conflict) {
      return res.status(409).json({
        success: false,
        message: "This table conflicts with another booking and cannot be confirmed."
      });
    }
  }

  booking.status = status;
  await booking.save();

  await sendNotification(
    booking.user,
    `Booking ${status}`,
    `Your booking at ${booking.restaurant?.name || "the restaurant"} is now ${status}.`
  );

  const updatedBooking = await Booking.findById(booking._id)
    .populate("user", "name email phone")
    .populate(bookingPopulate);

  res.json({
    success: true,
    message: `Booking ${status} successfully.`,
    booking: updatedBooking
  });
});

export {
  createBooking,
  getMyBookings,
  getBookingHistory,
  cancelBooking,
  getAllBookings,
  updateBookingStatus,
  updateExpiredBookings
};
