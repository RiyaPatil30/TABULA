
import Restaurant from "../models/restaurantModel.js";
import RecentlyViewed from "../models/recentlyViewedModel.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getRestaurants = asyncHandler(async (req, res) => {
  const {
    search = "",
    cuisine = ""
  } = req.query;

  const filter = { isActive: true };
 

  if (search.trim()) {
    filter.$or = [
      { name: { $regex: search.trim(), $options: "i" } },
      { address: { $regex: search.trim(), $options: "i" } },
      { description: { $regex: search.trim(), $options: "i" } }
    ];
  }

  if (cuisine.trim()) {
    filter.cuisine = {
      $regex: cuisine.trim(),
      $options: "i"
    };
  }

  const restaurants = await Restaurant.find(filter)
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: restaurants.length,
    restaurants
  });
});

export const getRestaurantById = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findOne({
    _id: req.params.id,
    isActive: true
  });

  if (!restaurant) {
    return res.status(404).json({
      success: false,
      message: "Restaurant not found."
    });
  }

  if (req.user?.role === "user") {
    await RecentlyViewed.findOneAndUpdate(
      {
        user: req.user._id,
        restaurant: restaurant._id
      },
      {
        $set: { viewedAt: new Date() }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  res.json({
    success: true,
    restaurant
  });
});

export const createRestaurant = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    cuisine,
    address,
    phone,
    openingHours
  } = req.body;

  if (!name?.trim() || !cuisine?.trim() || !address?.trim()) {
    return res.status(400).json({
      success: false,
      message: "Restaurant name, cuisine and address are required."
    });
  }

  const restaurant = await Restaurant.create({
    name: name.trim(),
    description: description || "",
    cuisine: cuisine.trim(),
    address: address.trim(),
    phone: phone || "",
    openingHours: openingHours || "",
    createdBy: req.user._id
  });

  res.status(201).json({
    success: true,
    message: "Restaurant created successfully.",
    restaurant
  });
});

export const updateRestaurant = asyncHandler(async (req, res) => {
  const allowedFields = [
    "name",
    "description",
    "cuisine",
    "address",
    "phone",
    "openingHours"
  ];

  const restaurant = await Restaurant.findById(req.params.id);

  if (!restaurant) {
    return res.status(404).json({
      success: false,
      message: "Restaurant not found."
    });
  }

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      restaurant[field] = req.body[field];
    }
  }

  await restaurant.save();

  res.json({
    success: true,
    message: "Restaurant updated successfully.",
    restaurant
  });
});

export const deleteRestaurant = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.id);

  if (!restaurant) {
    return res.status(404).json({
      success: false,
      message: "Restaurant not found."
    });
  }

  // Soft delete: keep historical bookings intact.
  restaurant.isActive = false;
  await restaurant.save();

  res.json({
    success: true,
    message: "Restaurant deactivated successfully."
  });
});

export const getRecentlyViewed = asyncHandler(async (req, res) => {
  const items = await RecentlyViewed.find({ user: req.user._id })
    .sort({ viewedAt: -1 })
    .limit(10)
    .populate({
      path: "restaurant",
      match: { isActive: true }
    });

  res.json({
    success: true,
    restaurants: items
      .filter((item) => item.restaurant)
      .map((item) => ({
        ...item.restaurant.toObject(),
        viewedAt: item.viewedAt
      }))
  });
});
