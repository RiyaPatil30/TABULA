
import mongoose from "mongoose";
import Table from "../models/tableModel.js";
import Booking from "../models/bookingModel.js";
import Restaurant from "../models/restaurantModel.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getTables = asyncHandler(async (req, res) => {
  const { restaurantId } = req.params;

  if (!mongoose.isValidObjectId(restaurantId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid restaurant ID."
    });
  }

  const restaurant = await Restaurant.findOne({
    _id: restaurantId,
    isActive: true
  });

  if (!restaurant) {
    return res.status(404).json({
      success: false,
      message: "Restaurant not found or inactive."
    });
  }

  const tables = await Table.find({
    restaurant: restaurant._id,
    isActive: true
  }).sort({ tableNumber: 1 });

  return res.json({ success: true, tables });
});

export const createTable = asyncHandler(async (req, res) => {
  const { tableNumber, capacity, location } = req.body;
  const { restaurantId } = req.params;

  if (!mongoose.isValidObjectId(restaurantId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid restaurant ID."
    });
  }

  if (
    typeof tableNumber !== "string" ||
    !tableNumber.trim() ||
    !Number.isInteger(Number(capacity)) ||
    Number(capacity) < 1
  ) {
    return res.status(400).json({
      success: false,
      message: "Enter a table number and valid capacity."
    });
  }

  const restaurant = await Restaurant.findOne({
    _id: restaurantId,
    isActive: true
  });

  if (!restaurant) {
    return res.status(404).json({
      success: false,
      message: "Restaurant not found or inactive."
    });
  }

  const table = await Table.create({
    restaurant: restaurant._id,
    tableNumber: tableNumber.trim(),
    capacity: Number(capacity),
    location: location || "",
    isActive: true
  });

  return res.status(201).json({
    success: true,
    message: "Table created successfully.",
    table
  });
});

export const updateTable = asyncHandler(async (req, res) => {
  const table = await Table.findById(req.params.id);

  if (!table) {
    return res.status(404).json({
      success: false,
      message: "Table not found."
    });
  }

  const { tableNumber, capacity, location, isActive } = req.body;

  if (tableNumber !== undefined) {
    if (typeof tableNumber !== "string" || !tableNumber.trim()) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid table number."
      });
    }

    table.tableNumber = tableNumber.trim();
  }

  if (capacity !== undefined) {
    if (
      !Number.isInteger(Number(capacity)) ||
      Number(capacity) < 1
    ) {
      return res.status(400).json({
        success: false,
        message: "Capacity must be a positive whole number."
      });
    }

    table.capacity = Number(capacity);
  }

  if (location !== undefined) {
    table.location = location;
  }

  if (isActive !== undefined) {
    table.isActive = isActive === true;
  }

  await table.save();

  return res.json({
    success: true,
    message: "Table updated successfully.",
    table
  });
});

export const deleteTable = asyncHandler(async (req, res) => {
  const table = await Table.findById(req.params.id);

  if (!table) {
    return res.status(404).json({
      success: false,
      message: "Table not found."
    });
  }

  table.isActive = false;
  await table.save();

  return res.json({
    success: true,
    message: "Table deactivated successfully."
  });
});

export const checkAvailability = asyncHandler(async (req, res) => {
  const { restaurantId } = req.params;
  const { date, startTime, endTime, guests } = req.query;

  if (!mongoose.isValidObjectId(restaurantId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid restaurant ID."
    });
  }

  if (!date || !startTime || !endTime || guests === undefined) {
    return res.status(400).json({
      success: false,
      message: "Date, time and guest count are required."
    });
  }

  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    !/^([01]\d|2[0-3]):[0-5]\d$/.test(startTime) ||
    !/^([01]\d|2[0-3]):[0-5]\d$/.test(endTime) ||
    startTime >= endTime ||
    !Number.isInteger(Number(guests)) ||
    Number(guests) < 1 ||
    Number(guests) > 20
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid date, time or guest count."
    });
  }

  const bookingDate = new Date(`${date}T00:00:00.000Z`);

  if (
    Number.isNaN(bookingDate.getTime()) ||
    bookingDate.toISOString().slice(0, 10) !== date
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid booking date."
    });
  }

  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());

  if (date < today) {
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
      message: "Restaurant not found or inactive."
    });
  }

  const suitableTables = await Table.find({
    restaurant: restaurant._id,
    isActive: true,
    capacity: { $gte: Number(guests) }
  }).sort({ tableNumber: 1 });

  if (suitableTables.length === 0) {
    return res.json({
      success: true,
      available: false,
      tables: [],
      message: "No active tables can accommodate these guests. Please add tables for this restaurant."
    });
  }

  const dayEnd = new Date(bookingDate);
  dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);

  const existingBookings = await Booking.find({
    restaurant: restaurant._id,
    table: { $in: suitableTables.map((table) => table._id) },
    bookingDate: { $gte: bookingDate, $lt: dayEnd },
    status: { $in: ["pending", "confirmed"] },
    startTime: { $lt: endTime },
    endTime: { $gt: startTime }
  }).select("table");

  const busyTableIds = new Set(
    existingBookings
      .filter((booking) => booking.table)
      .map((booking) => String(booking.table))
  );

  const availableTables = suitableTables.filter(
    (table) => !busyTableIds.has(String(table._id))
  );

  return res.json({
    success: true,
    available: availableTables.length > 0,
    tables: availableTables,
    message: availableTables.length > 0
      ? "Available tables found."
      : "All suitable tables are booked for this time."
  });
});
