
import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Restaurant",
    required: true
  },
  // Optional: booking requests do not need a table record.
  table: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Table",
    default: null
  },
  bookingDate: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true,
    match: /^([01]\d|2[0-3]):[0-5]\d$/
  },
  endTime: {
    type: String,
    required: true,
    match: /^([01]\d|2[0-3]):[0-5]\d$/
  },
  guests: {
    type: Number,
    required: true,
    min: 1
  },
  status: {
    type: String,
    enum: [
      "pending",
      "confirmed",
      "rejected",
      "cancelled",
      "completed"
    ],
    default: "pending"
  },
  specialRequests: {
    type: String,
    default: "",
    maxlength: 500
  },
  cancellationReason: {
    type: String,
    default: ""
  }
}, { timestamps: true });

export default mongoose.model("Booking", bookingSchema);
