import mongoose from "mongoose";

const recentlyViewedSchema = new mongoose.Schema({
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
  viewedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

recentlyViewedSchema.index(
  { user: 1, restaurant: 1 },
  { unique: true }
);

export default mongoose.model(
  "RecentlyViewed",
  recentlyViewedSchema
);