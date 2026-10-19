
import Favorite from "../models/favoriteModel.js";
import Restaurant from "../models/restaurantModel.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getFavorites = asyncHandler(async (req, res) => {
  const favorites = await Favorite.find({ user: req.user._id })
    .populate({
      path: "restaurant",
      match: { isActive: true }
    })
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    favorites: favorites.filter((item) => item.restaurant)
  });
});

export const addFavorite = asyncHandler(async (req, res) => {
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

  const favorite = await Favorite.findOneAndUpdate(
    {
      user: req.user._id,
      restaurant: restaurant._id
    },
    {
      $setOnInsert: {
        user: req.user._id,
        restaurant: restaurant._id
      }
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true
    }
  );

  res.status(200).json({
    success: true,
    message: "Restaurant added to favorites.",
    favorite
  });
});

export const removeFavorite = asyncHandler(async (req, res) => {
  const result = await Favorite.findOneAndDelete({
    user: req.user._id,
    restaurant: req.params.restaurantId
  });

  if (!result) {
    return res.status(404).json({
      success: false,
      message: "Favorite not found."
    });
  }

  res.json({
    success: true,
    message: "Restaurant removed from favorites."
  });
});
