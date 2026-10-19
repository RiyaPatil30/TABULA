
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { CalendarDays, Users, History } from "lucide-react";
import api from "../lib/axios";

function BookingHistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get("/api/bookings/history");
        const data = response.data;

        setHistory(
          Array.isArray(data)
            ? data
            : data.bookings || data.data || []
        );
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to load booking history. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const formatDate = (date) => {
    if (!date) return "Date not available";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const statusStyle = (status) => {
    const styles = {
      completed: "bg-emerald-100 text-emerald-800",
      cancelled: "bg-gray-200 text-gray-700",
      rejected: "bg-red-100 text-red-800",
    };

    return (
      styles[status?.toLowerCase()] ||
      "bg-amber-100 text-amber-800"
    );
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7f5ec] px-4 py-12 text-center">
        <p className="font-semibold text-emerald-900">
          Loading booking history...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f5ec] px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-700">
            Your Tabula Account
          </p>

          <h1 className="mt-2 text-3xl font-extrabold text-emerald-950 sm:text-4xl">
            Booking History
          </h1>

          <p className="mt-3 text-gray-600">
            View your previous restaurant reservations.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl bg-red-100 p-4 text-red-800">
            {error}
          </div>
        )}

        {!error && history.length === 0 && (
          <section className="rounded-3xl border border-emerald-100 bg-white px-6 py-14 text-center shadow-lg shadow-emerald-950/5">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-50">
              <History size={38} className="text-emerald-800" />
            </div>

            <h2 className="mt-6 text-2xl font-bold text-emerald-950">
              No Booking History
            </h2>

            <p className="mt-3 text-gray-600">
              Your previous reservations will appear here.
            </p>

            <Link
              to="/restaurants"
              className="mt-7 inline-flex rounded-xl bg-emerald-800 px-6 py-3 font-bold text-white hover:bg-emerald-700"
            >
              Explore Restaurants
            </Link>
          </section>
        )}

        <div className="grid gap-5">
          {history.map((booking) => {
            const restaurant =
              typeof booking.restaurant === "object"
                ? booking.restaurant
                : null;

            const status = booking.status || "unknown";

            return (
              <section
                key={booking._id || booking.id}
                className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-md shadow-emerald-950/5"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <h2 className="text-xl font-bold text-emerald-950">
                    {restaurant?.name ||
                      (typeof booking.restaurant === "string"
                        ? booking.restaurant
                        : "Restaurant")}
                  </h2>

                  <span
                    className={`rounded-full px-4 py-2 text-sm font-bold capitalize ${statusStyle(status)}`}
                  >
                    {status}
                  </span>
                </div>

                <div className="mt-5 grid gap-4 text-gray-700 sm:grid-cols-2">
                  <p className="flex items-center gap-2">
                    <CalendarDays
                      size={19}
                      className="text-emerald-700"
                    />
                    {formatDate(booking.bookingDate || booking.date)}
                  </p>

                  <p className="flex items-center gap-2">
                    <Users
                      size={19}
                      className="text-emerald-700"
                    />
                    {booking.guests ?? "N/A"} guests
                  </p>
                </div>
              </section>
            );
          })}
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-6">
          <Link
            to="/my-bookings"
            className="font-semibold text-emerald-800"
          >
            My Bookings
          </Link>

          <Link
            to="/restaurants"
            className="font-semibold text-emerald-800"
          >
            Explore Restaurants
          </Link>

          <Link to="/" className="font-semibold text-gray-600">
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}

export default BookingHistoryPage;
