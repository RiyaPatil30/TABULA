import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router";
import {
  UtensilsCrossed,
  House,
  Store,
  CalendarDays,
  Heart,
  Bell,
  UserRound,
  LogIn,
  LogOut,
  ArrowUpRight,
  Sparkles,
  ShieldCheck,
  LayoutDashboard,
  X,
  LockKeyhole,
  ArrowRight,
  Clock,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../lib/axios";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loginPrompt, setLoginPrompt] = useState(null);

  const fetchUser = async () => {
    try {
      const { data } = await api.get("/api/auth/me");
      setUser(data.user);
    } catch {
      setUser(null);
      setUnreadCount(0);
    } finally {
      setCheckingAuth(false);
    }
  };

  useEffect(() => {
    fetchUser();

    const handleFocus = () => fetchUser();
    window.addEventListener("focus", handleFocus);

    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  useEffect(() => {
    if (!user || user.role === "admin") {
      setUnreadCount(0);
      return;
    }

    let active = true;

    const fetchNotifications = async () => {
      if (location.pathname === "/notifications") {
        setUnreadCount(0);
        return;
      }

      try {
        const { data } = await api.get("/api/notifications");

        if (active) {
          setUnreadCount(data.unreadCount || 0);
        }
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    };

    fetchNotifications();

    const interval = window.setInterval(fetchNotifications, 10000);
    window.addEventListener("focus", fetchNotifications);

    return () => {
      active = false;
      window.clearInterval(interval);
      window.removeEventListener("focus", fetchNotifications);
    };
  }, [user, location.pathname]);

  useEffect(() => {
    setLoginPrompt(null);
  }, [location.pathname]);

  const handleProtectedNavigation = (event, section) => {
    if (checkingAuth || user) return;

    event.preventDefault();
    setLoginPrompt(section);
  };

  const promptContent = {
    bookings: {
      icon: CalendarDays,
      title: "Your next memorable meal awaits.",
      description:
        "Sign in to manage your reservations and keep your dining plans in one place.",
    },
    favorites: {
      icon: Heart,
      title: "Save the places you love.",
      description:
        "Log in to save your favorite restaurants and find the places worth coming back to.",
    },
    profile: {
      icon: UserRound,
      title: "Make every visit yours.",
      description:
        "Sign in to access your profile and make your dining experience more personal.",
    },
    "recently-viewed": {
      icon: Clock,
      title: "Pick up where you left off.",
      description:
        "Sign in to revisit restaurants you have explored recently.",
    },
  };

  const handleLogout = async () => {
    try {
      await api.post("/api/auth/logout");
      setUser(null);
      setUnreadCount(0);
      toast.success("Logged out successfully.");
      navigate("/login");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Logout failed. Please try again."
      );
    }
  };

  const linkStyle = ({ isActive }) =>
    `flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
      isActive
        ? "bg-emerald-500/15 text-emerald-300 shadow-inner"
        : "text-gray-300 hover:bg-white/10 hover:text-white"
    }`;

  const activePrompt = loginPrompt ? promptContent[loginPrompt] : null;
  const PromptIcon = activePrompt?.icon;

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-emerald-900/80 bg-gray-950 text-white shadow-xl">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-4 px-5 py-4 lg:px-8">
          <Link to="/" className="group flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-800 text-white shadow-lg shadow-emerald-900/40 transition-transform group-hover:rotate-[-6deg]">
              <UtensilsCrossed size={25} strokeWidth={2.2} />
            </span>

            <span>
              <span className="flex items-center gap-2 text-2xl font-black tracking-[0.16em] text-white">
                TABULA
                <Sparkles size={15} className="text-amber-400" />
              </span>
              <span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
                Where Unforgettable Meals Begin
              </span>
            </span>
          </Link>

          <nav className="flex flex-wrap items-center justify-center gap-1.5">
            <NavLink to="/" end className={linkStyle}>
              <House size={17} />
              <span>Home</span>
            </NavLink>

            <NavLink to="/restaurants" className={linkStyle}>
              <Store size={17} />
              <span>Restaurants</span>
            </NavLink>

            {user?.role !== "admin" && (
              <>
                <NavLink
                  to="/my-bookings"
                  className={linkStyle}
                  onClick={(event) =>
                    handleProtectedNavigation(event, "bookings")
                  }
                >
                  <CalendarDays size={17} />
                  <span>My Bookings</span>
                </NavLink>

                <NavLink
                  to="/favorites"
                  className={linkStyle}
                  onClick={(event) =>
                    handleProtectedNavigation(event, "favorites")
                  }
                >
                  <Heart size={17} />
                  <span>Favorites</span>
                </NavLink>

                <NavLink
                  to="/recently-viewed"
                  className={linkStyle}
                  onClick={(event) =>
                    handleProtectedNavigation(event, "recently-viewed")
                  }
                >
                  <Clock size={17} />
                  <span>Recently Viewed</span>
                </NavLink>
              </>
            )}

            {user && user.role !== "admin" && (
              <NavLink to="/notifications" className={linkStyle}>
                <span className="relative inline-flex">
                  <Bell size={17} />
                  {unreadCount > 0 &&
                    location.pathname !== "/notifications" && (
                      <span className="absolute -right-3 -top-3 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-extrabold text-white ring-2 ring-gray-950">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                </span>
                <span>Notifications</span>
              </NavLink>
            )}

            {user?.role === "admin" && (
              <NavLink to="/admin/dashboard" className={linkStyle}>
                <LayoutDashboard size={17} />
                <span>Admin Dashboard</span>
              </NavLink>
            )}

            {user?.role !== "admin" && (
              <NavLink
                to="/profile"
                className={linkStyle}
                onClick={(event) =>
                  handleProtectedNavigation(event, "profile")
                }
              >
                <UserRound size={17} />
                <span>
                  {user?.name ? user.name.split(" ")[0] : "Profile"}
                </span>
              </NavLink>
            )}
          </nav>

          <div className="flex flex-wrap items-center gap-2">
            {!checkingAuth && !user && (
              <>
                <Link
                  to="/login"
                  className="flex items-center gap-2 rounded-xl border border-gray-700 px-3 py-2.5 text-sm font-semibold text-gray-200 transition hover:border-emerald-500 hover:text-emerald-300"
                >
                  <LogIn size={17} />
                  Login / Register
                </Link>

                <Link
                  to="/admin/login"
                  className="flex items-center gap-2 rounded-xl border border-emerald-700 px-3 py-2.5 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-500/10"
                >
                  <ShieldCheck size={17} />
                  Admin Login
                </Link>
              </>
            )}

            {!checkingAuth && user && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-xl border border-red-800 px-3 py-2.5 text-sm font-semibold text-red-300 transition hover:bg-red-500/10"
              >
                <LogOut size={17} />
                Logout
              </button>
            )}

            {user?.role !== "admin" && (
              <Link
                to="/restaurants"
                className="group flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-bold text-gray-950 shadow-lg shadow-emerald-950/40 transition hover:-translate-y-0.5 hover:bg-emerald-400"
              >
                <UtensilsCrossed size={17} />
                <span>Reserve a Table</span>
                <ArrowUpRight
                  size={16}
                  className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </Link>
            )}
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-emerald-500/60 to-transparent" />
      </header>

      {activePrompt && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setLoginPrompt(null);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="tabula-login-title"
            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-emerald-800/60 bg-gray-950 p-7 text-center text-white shadow-2xl shadow-black/50 sm:p-9"
          >
            <button
              type="button"
              onClick={() => setLoginPrompt(null)}
              aria-label="Close login message"
              className="absolute right-4 top-4 rounded-xl p-2 text-gray-400 transition hover:bg-white/10 hover:text-white"
            >
              <X size={20} />
            </button>

            <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-emerald-500 via-amber-400 to-emerald-700" />

            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-700/50 bg-emerald-500/10 text-emerald-300">
              <PromptIcon size={30} />
            </div>

            <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-800/70 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-emerald-300">
              <LockKeyhole size={13} />
              Your Tabula experience
            </span>

            <h2
              id="tabula-login-title"
              className="mt-3 text-2xl font-black leading-tight sm:text-3xl"
            >
              {activePrompt.title}
            </h2>

            <p className="mx-auto mt-4 max-w-sm text-sm leading-7 text-gray-400">
              {activePrompt.description}
            </p>

            <button
              type="button"
              onClick={() => {
                const from =
                  loginPrompt === "bookings"
                    ? "/my-bookings"
                    : loginPrompt === "recently-viewed"
                      ? "/recently-viewed"
                      : `/${loginPrompt}`;

                setLoginPrompt(null);
                navigate("/login", { state: { from } });
              }}
              className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3.5 font-bold text-gray-950 shadow-lg shadow-emerald-950/40 transition hover:-translate-y-0.5 hover:bg-emerald-400"
            >
              <LogIn size={18} />
              Login to Continue
              <ArrowRight size={18} />
            </button>

            <p className="mt-4 text-sm text-gray-400">
              New to Tabula?{" "}
              <Link
                to="/register"
                onClick={() => setLoginPrompt(null)}
                className="font-semibold text-emerald-300 underline-offset-4 hover:underline"
              >
                Create an account
              </Link>
            </p>

            <p className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500">
              <Sparkles size={13} className="text-amber-400" />
              Where Unforgettable Meals Begin
            </p>
          </section>
        </div>
      )}
    </>
  );
};

export default Navbar;