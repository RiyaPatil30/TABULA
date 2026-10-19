
import Review from "../models/reviewModel.js";
import Restaurant from "../models/restaurantModel.js";
import Booking from "../models/bookingModel.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { updateExpiredBookings } from "./bookingController.js";

// Get all reviews for a restaurant
export const getRestaurantReviews = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findOne({
    _id: req.params.restaurantId,
    isActive: true
  });

  if (!restaurant) {
    return res.status(404).json({
      success: false,
      message: "Restaurant not found."
    });
  }

  const reviews = await Review.find({
    restaurant: restaurant._id
  })
    .populate("user", "name")
    .sort({ createdAt: -1 });

  const total = reviews.length;

  const averageRating = total
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / total
    : 0;

  res.status(200).json({
    success: true,
    count: total,
    averageRating: Number(averageRating.toFixed(1)),
    reviews
  });
});

// Add or update a restaurant review
export const addOrUpdateReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const numericRating = Number(rating);

  if (
    !Number.isInteger(numericRating) ||
    numericRating < 1 ||
    numericRating > 5
  ) {
    return res.status(400).json({
      success: false,
      message: "Rating must be a whole number from 1 to 5."
    });
  }

  const restaurant = await Restaurant.findOne({
    _id: req.params.restaurantId,
    isActive: true
  });

  if (!restaurant) {
    return res.status(404).json({
      success: false,
      message: "Restaurant not found."
    });
  }

  // Update this user's expired confirmed bookings first.
  await updateExpiredBookings(req.user._id);

  // A user can review only after a completed booking.
  const hasCompletedBooking = await Booking.exists({
    user: req.user._id,
    restaurant: restaurant._id,
    status: "completed"
  });

  if (!hasCompletedBooking) {
    return res.status(403).json({
      success: false,
      message: "You can review a restaurant after a completed booking."
    });
  }

  const review = await Review.findOneAndUpdate(
    {
      user: req.user._id,
      restaurant: restaurant._id
    },
    {
      $set: {
        rating: numericRating,
        comment: typeof comment === "string" ? comment.trim() : ""
      }
    },
    {
      upsert: true,
      returnDocument: "after",
      runValidators: true,
      setDefaultsOnInsert: true
    }
  );

  res.status(200).json({
    success: true,
    message: "Review saved successfully.",
    review
  });
});

// Delete the logged-in user's own review
export const deleteMyReview = asyncHandler(async (req, res) => {
  const review = await Review.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id
  });

  if (!review) {
    return res.status(404).json({
      success: false,
      message: "Review not found."
    });
  }

  res.status(200).json({
    success: true,
    message: "Review deleted successfully."
  });
});
