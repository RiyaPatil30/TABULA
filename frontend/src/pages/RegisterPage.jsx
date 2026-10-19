
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import toast from "react-hot-toast";
import api from "../lib/axios";

function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const { data } = await api.post("/api/auth/register", {
        name,
        email,
        password,
      });

      toast.success(data.message || "Registration successful!");
      navigate("/login");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <h1>Create Account</h1>
      <p>Join Tabula and reserve your favourite restaurant.</p>

      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>
      </form>

      <p>
        Already have an account? <Link to="/login">Login</Link>
      </p>

      <Link to="/">Back to Home</Link>
    </div>
  );
}

export default RegisterPage;
