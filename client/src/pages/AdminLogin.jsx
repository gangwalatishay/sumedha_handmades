import { API_BASE } from "../utils/api";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/auth.css";

const AdminLogin = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /* =========================
     HANDLE INPUT
  ========================= */
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  /* =========================
     ADMIN LOGIN
  ========================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const res = await fetch(
        `${API_BASE}/api/admin/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Login failed");

      /* ✅ SAVE AUTH */
      localStorage.setItem("token", data.token);
      localStorage.setItem(
        "customer",
        JSON.stringify({ ...data.admin, isAdmin: true })
      );

      /* ✅ GO ADMIN PANEL */
      navigate("/admin-panel");

    } catch (err) {
      setError(err.message || "Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h1>Admin Login</h1>

      <p className="auth-subtext">
        Login securely to manage products,
        orders & analytics.
      </p>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Admin Email"
          value={form.email}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Admin Password"
          value={form.password}
          onChange={handleChange}
          required
        />

        <button
          className="btn-primary auth-btn"
          type="submit"
          disabled={loading}
        >
          {loading
            ? "Logging in..."
            : "Login as Admin"}
        </button>
      </form>

      {error && (
        <p className="error-text">{error}</p>
      )}
    </div>
  );
};

export default AdminLogin;
