
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import toast from "react-hot-toast";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import api from "../lib/axios";

function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (loading) return;

    setLoading(true);

    try {
      const response = await api.post("/api/auth/admin/login", {
        email,
        password,
      });

      const data = response.data;
      const user = data.user;

      if (!user || user.role !== "admin") {
        toast.error("Admin account required.");
        return;
      }

      localStorage.setItem("user", JSON.stringify(user));

      toast.success("Admin login successful!");
      navigate("/admin/dashboard");
    } catch (error) {
      console.error("Admin login error:", error);

      toast.error(
        error.response?.data?.message || "Admin login failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 px-4 py-10 text-white">
      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-emerald-500/20 bg-gray-900 p-7 shadow-2xl shadow-emerald-950/30 sm:p-9">
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400">
              <ShieldCheck size={34} />
            </div>
          </div>

          <div className="mb-8 text-center">
            <h1 className="text-3xl font-black tracking-wide">
              Admin Login
            </h1>

            <p className="mt-3 text-sm leading-6 text-gray-400">
              Login to manage Tabula reservations.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label
                htmlFor="admin-email"
                className="mb-2 block text-sm font-semibold text-gray-300"
              >
                Admin Email
              </label>

              <input
                id="admin-email"
                type="email"
                placeholder="Enter admin email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                className="w-full rounded-xl border border-gray-700 bg-gray-950 px-4 py-3.5 text-white outline-none transition placeholder:text-gray-500 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/10"
                required
              />
            </div>

            <div>
              <label
                htmlFor="admin-password"
                className="mb-2 block text-sm font-semibold text-gray-300"
              >
                Password
              </label>

              <input
                id="admin-password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="w-full rounded-xl border border-gray-700 bg-gray-950 px-4 py-3.5 text-white outline-none transition placeholder:text-gray-500 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/10"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-emerald-500 px-4 py-3.5 font-bold text-gray-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Logging in..." : "Login as Admin"}
            </button>
          </form>

          <div className="mt-7 border-t border-gray-800 pt-5 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-gray-400 transition hover:text-white"
            >
              <ArrowLeft size={16} />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLoginPage;
