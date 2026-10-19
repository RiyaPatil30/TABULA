import { Routes, Route } from "react-router";
import "./App.css";
import Navbar from "./components/Navbar";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import RestaurantListPage from "./pages/RestaurantListPage";
import RestaurantDetailPage from "./pages/RestaurantDetailPage";
import RecentlyViewedPage from "./pages/RecentlyViewedPage";
import BookingPage from "./pages/BookingPage";
import MyBookingsPage from "./pages/MyBookingsPage";
import BookingHistoryPage from "./pages/BookingHistoryPage";
import FavoritesPage from "./pages/FavoritesPage";
import NotificationsPage from "./pages/NotificationsPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";

function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<HomePage />} />

        {/* Login and Register on the same page */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<LoginPage />} />

        <Route path="/profile" element={<ProfilePage />} />

        <Route path="/restaurants" element={<RestaurantListPage />} />
        <Route
          path="/restaurants/:id"
          element={<RestaurantDetailPage />}
        />
        <Route
          path="/recently-viewed"
          element={<RecentlyViewedPage />}
        />

        <Route path="/booking/:id" element={<BookingPage />} />
        <Route path="/my-bookings" element={<MyBookingsPage />} />
        <Route path="/booking-history" element={<BookingHistoryPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route
          path="/admin/dashboard"
          element={<AdminDashboardPage />}
        />
      </Routes>
    </>
  );
}

export default App;