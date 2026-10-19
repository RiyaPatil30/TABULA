
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import api from "../lib/axios";

const LoginPage = () => {
  const navigate = useNavigate();

  const [mode, setMode] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [loading, setLoading] = useState(false);

  const inputStyle = {
    width: "100%",
    padding: "12px 14px",
    border: "1px solid #d8d8c8",
    borderRadius: "8px",
    fontSize: "15px",
    outline: "none",
    boxSizing: "border-box",
    background: "#fff",
    color: "#263b2b",
  };

  const buttonStyle = {
    width: "100%",
    padding: "13px",
    background: "#284b35",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: loading ? "not-allowed" : "pointer",
    opacity: loading ? 0.7 : 1,
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    setLoading(true);

    try {
      if (mode === "forgot") {
        if (!email.trim()) {
          toast.error("Please enter your email.");
          return;
        }

        const { data } = await api.post("/api/auth/forgot-password", {
          email: email.trim(),
        });

        if (!data.resetToken) {
          toast.error("Reset token was not returned by the server.");
          return;
        }

        setResetToken(data.resetToken);
        setPassword("");
        setConfirmPassword("");
        setMode("reset");

        toast.success("Enter your new password.");
      } else if (mode === "reset") {
        if (!resetToken) {
          toast.error("Please start the password reset process again.");
          setMode("forgot");
          return;
        }

        if (password.length < 8) {
          toast.error("Password must be at least 8 characters.");
          return;
        }

        if (password !== confirmPassword) {
          toast.error("Passwords do not match.");
          return;
        }

        const { data } = await api.post(
          `/api/auth/reset-password/${resetToken.trim()}`,
          { password, confirmPassword }
        );

        toast.success(data.message || "Password reset successfully.");

        setPassword("");
        setConfirmPassword("");
        setResetToken("");
        setMode("login");
      } else if (mode === "register") {
        if (!name.trim()) {
          toast.error("Please enter your name.");
          return;
        }

        if (password.length < 8) {
          toast.error("Password must be at least 8 characters.");
          return;
        }

        if (password !== confirmPassword) {
          toast.error("Passwords do not match.");
          return;
        }

        const { data } = await api.post("/api/auth/register", {
          name: name.trim(),
          email: email.trim(),
          password,
        });

        toast.success(data.message || "Registration successful.");

        setPassword("");
        setConfirmPassword("");
        setMode("login");
      } else {
        const { data } = await api.post("/api/auth/login", {
          email: email.trim(),
          password,
        });

        toast.success(data.message || "Login successful.");
        navigate("/");
      }
    } catch (error) {
      console.error("Authentication error:", error);

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Something went wrong. Please try again.";

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const heading =
    mode === "register"
      ? "Create Account"
      : mode === "forgot"
        ? "Forgot Password"
        : mode === "reset"
          ? "Set New Password"
          : "Welcome Back";

  const description =
    mode === "register"
      ? "Create your Tabula account"
      : mode === "forgot"
        ? "Enter your registered email address"
        : mode === "reset"
          ? "Choose a new password for your account"
          : "Login to continue to Tabula";

  const submitLabel =
    mode === "register"
      ? "Create Account"
      : mode === "forgot"
        ? "Continue"
        : mode === "reset"
          ? "Reset Password"
          : "Login";

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);

    if (nextMode !== "reset") {
      setResetToken("");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f7f5ec",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "430px",
          background: "#fff",
          borderRadius: "16px",
          padding: "32px",
          boxShadow: "0 8px 30px rgba(40, 75, 53, 0.10)",
          boxSizing: "border-box",
        }}
      >
        <Link
          to="/"
          style={{
            display: "block",
            textAlign: "center",
            color: "#284b35",
            fontSize: "30px",
            fontWeight: "800",
            textDecoration: "none",
            marginBottom: "8px",
          }}
        >
          Tabula
        </Link>

        <h2
          style={{
            textAlign: "center",
            color: "#284b35",
            margin: "12px 0 8px",
            fontSize: "25px",
          }}
        >
          {heading}
        </h2>

        <p
          style={{
            textAlign: "center",
            color: "#777",
            margin: "0 0 25px",
            fontSize: "14px",
          }}
        >
          {description}
        </p>

        {(mode === "login" || mode === "register") && (
          <div
            style={{
              display: "flex",
              background: "#f1f1e8",
              borderRadius: "8px",
              padding: "4px",
              marginBottom: "24px",
            }}
          >
            <button
              type="button"
              onClick={() => switchMode("login")}
              style={{
                flex: 1,
                padding: "10px",
                border: "none",
                borderRadius: "6px",
                background: mode === "login" ? "#284b35" : "transparent",
                color: mode === "login" ? "#fff" : "#284b35",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              Login
            </button>

            <button
              type="button"
              onClick={() => switchMode("register")}
              style={{
                flex: 1,
                padding: "10px",
                border: "none",
                borderRadius: "6px",
                background: mode === "register" ? "#284b35" : "transparent",
                color: mode === "register" ? "#fff" : "#284b35",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              Register
            </button>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          {mode === "register" && (
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "7px",
                  color: "#284b35",
                  fontWeight: "600",
                  fontSize: "14px",
                }}
              >
                Full Name
              </label>

              <input
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={inputStyle}
              />
            </div>
          )}

          {["login", "register", "forgot"].includes(mode) && (
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "7px",
                  color: "#284b35",
                  fontWeight: "600",
                  fontSize: "14px",
                }}
              >
                Email Address
              </label>

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={inputStyle}
              />
            </div>
          )}

          {["login", "register", "reset"].includes(mode) && (
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "7px",
                  color: "#284b35",
                  fontWeight: "600",
                  fontSize: "14px",
                }}
              >
                {mode === "reset" ? "New Password" : "Password"}
              </label>

              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder={
                    mode === "reset"
                      ? "Enter new password"
                      : "Enter your password"
                  }
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={mode === "login" ? undefined : 8}
                  style={{ ...inputStyle, paddingRight: "45px" }}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    border: "none",
                    background: "transparent",
                    color: "#284b35",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>
            </div>
          )}

          {["register", "reset"].includes(mode) && (
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "7px",
                  color: "#284b35",
                  fontWeight: "600",
                  fontSize: "14px",
                }}
              >
                Confirm Password
              </label>

              <input
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                style={inputStyle}
              />
            </div>
          )}

          {mode === "login" && (
            <div style={{ textAlign: "right", marginTop: "-6px" }}>
              <button
                type="button"
                onClick={() => switchMode("forgot")}
                style={{
                  border: "none",
                  background: "transparent",
                  color: "#284b35",
                  fontSize: "13px",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                Forgot Password?
              </button>
            </div>
          )}

          <button type="submit" disabled={loading} style={buttonStyle}>
            {loading ? "Please wait..." : submitLabel}
          </button>
        </form>

        {(mode === "forgot" || mode === "reset") && (
          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <button
              type="button"
              onClick={() => switchMode("login")}
              style={{
                border: "none",
                background: "transparent",
                color: "#284b35",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
