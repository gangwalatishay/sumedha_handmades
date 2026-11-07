import { API_BASE } from "../utils/api";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/auth.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const sendOtp = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(
        `${API_BASE}/api/customers/forgot-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setMessage("OTP sent to your email");
      setTimeout(() => navigate(`/verify-otp?email=${encodeURIComponent(email)}`), 1200);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h1>Forgot Password</h1>
      <p>We’ll send an OTP to your email</p>

      <form onSubmit={sendOtp} className="auth-form">
        <input
          type="email"
          placeholder="Enter your registered email"
          required
          onChange={(e) => setEmail(e.target.value)}
        />

        <button type="submit" className="btn-primary auth-btn" disabled={loading}>
          {loading ? "Sending…" : "Send OTP"}
        </button>
        {message && <p className="feedback" role="status">{message}</p>}
      </form>
    </div>
  );
};

export default ForgotPassword;
