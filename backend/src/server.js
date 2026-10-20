import dotenv from "dotenv";
dotenv.config();
 
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dns from "node:dns";
import cron from "node-cron";
 
import connectDB from "./config/db.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
 
import authRoutes from "./routes/authRoutes.js";
import restaurantRoutes from "./routes/restaurantRoutes.js";
import tableRoutes from "./routes/tableRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import favoriteRoutes from "./routes/favoriteRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
 
import Booking from "./models/bookingModel.js";
import Notification from "./models/notificationModel.js";
import { updateExpiredBookings } from "./controllers/bookingController.js";
 
const app = express();
 
dns.setServers(["8.8.8.8", "1.1.1.1"]);
 
// Render sits behind a proxy; needed for secure cookies to work.
app.set("trust proxy", 1);
 
// Strip any trailing slash so "https://site.com/" still matches.
const clean = (url) => (url ? url.trim().replace(/\/+$/, "") : url);
 
const allowedOrigins = [
  "http://localhost:5173",
  "https://tabula-t2bz.onrender.com",
  clean(process.env.CLIENT_URL),
].filter(Boolean);
 
const corsOptions = {
  origin: (origin, callback) => {
    // allow non-browser tools (curl, Postman) that send no Origin
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
 
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
 
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
 
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Tabula backend is running.",
  });
});
 
app.get("/api/status", (req, res) => {
  res.json({
    success: true,
    message: "Tabula API is running.",
  });
});
 
app.get("/favicon.ico", (req, res) => {
  res.status(204).end();
});
 
app.use("/api/auth", authRoutes);
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/tables", tableRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);
 
const startExpiredBookingCompletion = () => {
  cron.schedule("* * * * *", async () => {
    try {
      await updateExpiredBookings();
    } catch (error) {
      console.error("Expired booking completion failed:", error.message);
    }
  });
};
 
const startBookingReminder = () => {
  cron.schedule("*/15 * * * *", async () => {
    try {
      const now = new Date();
 
      const indiaDate = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(now);
 
      const [year, month, day] = indiaDate.split("-").map(Number);
 
      const tomorrow = new Date(
        Date.UTC(year, month - 1, day) + 24 * 60 * 60 * 1000
      );
 
      const dateString = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(tomorrow);
 
      const [nextYear, nextMonth, nextDay] = dateString
        .split("-")
        .map(Number);
 
      const dayStart = new Date(
        Date.UTC(nextYear, nextMonth - 1, nextDay) - 330 * 60 * 1000
      );
 
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
 
      const bookings = await Booking.find({
        status: "confirmed",
        bookingDate: {
          $gte: dayStart,
          $lt: dayEnd,
        },
      }).populate("restaurant", "name");
 
      for (const booking of bookings) {
        const title = "Booking reminder";
 
        const message = `Reminder: your booking at ${
          booking.restaurant?.name || "the restaurant"
        } is scheduled for tomorrow at ${booking.startTime}.`;
 
        const existingNotification = await Notification.findOne({
          user: booking.user,
          title,
          message,
          type: "booking",
        });
 
        if (!existingNotification) {
          await Notification.create({
            user: booking.user,
            title,
            message,
            type: "booking",
          });
        }
      }
    } catch (error) {
      console.error("Booking reminder failed:", error.message);
    }
  });
};
 
app.use(notFound);
app.use(errorHandler);
 
const startServer = async () => {
  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI is missing in the .env file.");
    process.exit(1);
  }
 
  if (!process.env.JWT_SECRET || !process.env.ADMIN_SETUP_KEY) {
    console.error("JWT_SECRET or ADMIN_SETUP_KEY is missing in the .env file.");
    process.exit(1);
  }
 
  try {
    await connectDB();
    await updateExpiredBookings();
 
    startExpiredBookingCompletion();
    startBookingReminder();
 
    const PORT = process.env.PORT || 3000;
 
    app.listen(PORT, () => {
      console.log(`Tabula backend running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start Tabula backend:", error.message);
    process.exit(1);
  }
};
 
startServer();
 
Claude finished the response
