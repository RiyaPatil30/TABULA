
import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  Bell,
  CalendarCheck,
  Clock,
  CheckCircle2,
  ArrowRight,
  CalendarDays,
  UtensilsCrossed,
  BellRing,
  RefreshCw,
} from "lucide-react";
import api from "../lib/axios";

function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadNotifications = async () => {
      setLoading(true);
      setError("");

      try {
        await api.patch("/api/notifications/read-all");

        const { data } = await api.get("/api/notifications");

        if (active) {
          setNotifications(data.notifications || []);
        }
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message ||
              "Could not load notifications. Please try again."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadNotifications();

    return () => {
      active = false;
    };
  }, []);

  const getKind = (notification) => {
    const text =
      `${notification.title || ""} ${notification.message || ""}`.toLowerCase();

    if (text.includes("reminder")) return "reminder";
    if (text.includes("confirm")) return "confirmed";
    if (text.includes("reject")) return "rejected";
    if (text.includes("cancel")) return "cancelled";
    if (text.includes("pending") || text.includes("approval")) {
      return "pending";
    }

    return "general";
  };

  const getIcon = (kind) => {
    if (kind === "confirmed") return <CalendarCheck size={22} />;
    if (kind === "reminder") return <BellRing size={24} />;
    if (kind === "pending") return <Clock size={22} />;
    return <Bell size={22} />;
  };

  const getStyle = (kind) => {
    if (kind === "confirmed") {
      return "bg-emerald-50 text-emerald-700";
    }
    if (kind === "reminder") {
      return "bg-amber-100 text-amber-800 ring-1 ring-amber-300";
    }
    if (kind === "rejected" || kind === "cancelled") {
      return "bg-rose-50 text-rose-700";
    }
    if (kind === "pending") {
      return "bg-blue-50 text-blue-700";
    }
    return "bg-stone-100 text-stone-600";
  };

  const formatDate = (value) => {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const reminderCount = notifications.filter(
    (notification) => getKind(notification) === "reminder"
  ).length;

  const retry = async () => {
    setLoading(true);
    setError("");

    try {
      await api.patch("/api/notifications/read-all");
      const { data } = await api.get("/api/notifications");
      setNotifications(data.notifications || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not load notifications. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-800">
              <Bell size={16} />
              Your updates
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
              Notifications
            </h1>

            <p className="mt-2 text-sm leading-6 text-stone-600 sm:text-base">
              Stay updated on your reservations and upcoming dining plans.
            </p>
          </div>

          <Link
            to="/my-bookings"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-800 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-900"
          >
            My Bookings
            <ArrowRight size={17} />
          </Link>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800">
                <Bell size={23} />
              </div>
              <div>
                <p className="text-sm text-stone-500">All notifications</p>
                <p className="text-2xl font-bold text-stone-900">
                  {notifications.length}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                <CalendarDays size={23} />
              </div>
              <div>
                <p className="text-sm text-stone-500">Booking reminders</p>
                <p className="text-2xl font-bold text-stone-900">
                  {reminderCount}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-stone-100 px-5 py-4 sm:px-6">
            <h2 className="text-lg font-bold text-stone-900">
              Recent activity
            </h2>
            <span className="text-sm text-stone-500">
              Latest updates
            </span>
          </div>

          {loading ? (
            <div className="px-6 py-16 text-center text-stone-500">
              <RefreshCw className="mx-auto mb-3 animate-spin" size={28} />
              Loading your notifications...
            </div>
          ) : error ? (
            <div className="px-6 py-16 text-center">
              <p className="text-sm text-rose-700">{error}</p>
              <button
                onClick={retry}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-800 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-900"
              >
                <RefreshCw size={16} />
                Try again
              </button>
            </div>
          ) : notifications.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-stone-100 text-stone-500">
                <Bell size={28} />
              </div>
              <h3 className="text-lg font-semibold text-stone-900">
                You're all caught up!
              </h3>
              <p className="mt-2 text-sm text-stone-500">
                New booking updates and reminders will appear here.
              </p>
              <Link
                to="/restaurants"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-800 px-5 py-3 font-semibold text-white transition hover:bg-emerald-900"
              >
                <UtensilsCrossed size={18} />
                Explore Restaurants
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {notifications.map((notification) => {
                const kind = getKind(notification);
                const isReminder = kind === "reminder";

                return (
                  <div
                    key={notification._id}
                    className={`flex gap-4 px-5 py-5 transition sm:px-6 ${
                      isReminder
                        ? "border-l-4 border-amber-400 bg-amber-50/80 hover:bg-amber-100/70"
                        : "hover:bg-stone-50"
                    }`}
                  >
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${getStyle(kind)} ${
                        isReminder ? "shadow-sm" : ""
                      }`}
                    >
                      {getIcon(kind)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3
                          className={`font-semibold ${
                            isReminder
                              ? "text-amber-950"
                              : "text-stone-900"
                          }`}
                        >
                          {isReminder && "⏰ "}
                          {notification.title}
                        </h3>

                        {isReminder && (
                          <span className="inline-flex items-center rounded-full border border-amber-300 bg-amber-100 px-2.5 py-1 text-[10px] font-extrabold tracking-wider text-amber-800">
                            BOOKING REMINDER
                          </span>
                        )}

                        {kind === "confirmed" && (
                          <CheckCircle2
                            size={18}
                            className="text-emerald-600"
                          />
                        )}
                      </div>

                      <p
                        className={`mt-1 text-sm leading-6 ${
                          isReminder
                            ? "font-medium text-amber-950"
                            : "text-stone-600"
                        }`}
                      >
                        {notification.message}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-stone-500">
                        {formatDate(notification.createdAt) && (
                          <span className="inline-flex items-center gap-1.5">
                            <CalendarDays size={14} />
                            {formatDate(notification.createdAt)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-stone-500">
            Your reservation updates, all in one place.
          </p>

          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-800 transition hover:text-emerald-950"
          >
            Back to Home
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NotificationsPage;
