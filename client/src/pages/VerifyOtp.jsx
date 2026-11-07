import { API_BASE } from "../utils/api";
// // // import { useState } from "react";
// // // import { useNavigate, useLocation } from "react-router-dom";
// // // import "../styles/auth.css";

// // // const VerifyOtp = () => {
// // //   const navigate = useNavigate();
// // //   const location = useLocation();

// // //   // email passed from ForgotPassword page
// // //   const email = location.state?.email;

// // //   const [otp, setOtp] = useState("");
// // //   const [error, setError] = useState("");
// // //   const [loading, setLoading] = useState(false);

// // //   const handleVerify = async (e) => {
// // //     e.preventDefault();
// // //     setError("");
// // //     setLoading(true);

// // //     try {
// // //       const res = await fetch(
// // //         `${API_BASE}/api/customers/verify-otp`,
// // //         {
// // //           method: "POST",
// // //           headers: { "Content-Type": "application/json" },
// // //           body: JSON.stringify({ email, otp }),
// // //         }
// // //       );

// // //       const data = await res.json();
// // //       if (!res.ok) throw new Error(data.message);

// // //       // ✅ OTP verified → go to reset password
// // //       navigate("/reset-password", { state: { email } });
// // //     } catch (err) {
// // //       setError(err.message);
// // //     } finally {
// // //       setLoading(false);
// // //     }
// // //   };

// // //   if (!email) {
// // //     return <p style={{ padding: "60px" }}>Invalid access</p>;
// // //   }

// // //   return (
// // //     <div className="auth-container">
// // //       <h1>Verify OTP</h1>
// // //       <p>Enter the OTP sent to <strong>{email}</strong></p>

// // //       <form onSubmit={handleVerify} className="auth-form">
// // //         <input
// // //           type="text"
// // //           placeholder="Enter 6-digit OTP"
// // //           value={otp}
// // //           onChange={(e) => setOtp(e.target.value)}
// // //           required
// // //         />

// // //         <button
// // //           type="submit"
// // //           className="btn-primary auth-btn"
// // //           disabled={loading}
// // //         >
// // //           {loading ? "Verifying..." : "Verify OTP"}
// // //         </button>

// // //         {error && <p className="auth-error">{error}</p>}
// // //       </form>
// // //     </div>
// // //   );
// // // };

// // // export default VerifyOtp;
// // import { useState } from "react";
// // import { useNavigate, useLocation } from "react-router-dom";

// // const VerifyOtp = () => {
// //   const navigate = useNavigate();
// //   const location = useLocation();

// //   const email = location.state?.email;

// //   const [otp, setOtp] = useState("");
// //   const [error, setError] = useState("");
// //   const [loading, setLoading] = useState(false);

// //   const handleVerify = async (e) => {
// //     e.preventDefault();
// //     setLoading(true);
// //     setError("");

// //     try {
// //       const res = await fetch(
// //         `${API_BASE}/api/customers/verify-otp`,
// //         {
// //           method: "POST",
// //           headers: { "Content-Type": "application/json" },
// //           body: JSON.stringify({ email, otp }),
// //         }
// //       );

// //       const data = await res.json();

// //       if (!res.ok) throw new Error(data.message);

// //       // ✅ OTP verified → go to reset password
// //       navigate("/reset-password", {
// //         state: { email },
// //       });
// //     } catch (err) {
// //       setError(err.message);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   if (!email) {
// //     return <p style={{ padding: "60px" }}>Invalid access</p>;
// //   }

// //   return (
// //     <div className="auth-container">
// //       <h1>Verify OTP</h1>
// //       <p>Enter the OTP sent to your email</p>

// //       <form onSubmit={handleVerify} className="auth-form">
// //         <input
// //           type="text"
// //           placeholder="Enter 6-digit OTP"
// //           value={otp}
// //           onChange={(e) => setOtp(e.target.value)}
// //           required
// //         />

// //         <button className="btn-primary" disabled={loading}>
// //           {loading ? "Verifying..." : "Verify OTP"}
// //         </button>

// //         {error && <p className="auth-error">{error}</p>}
// //       </form>
// //     </div>
// //   );
// // };

// // export default VerifyOtp;
// import { useState } from "react";
// import { useNavigate, useSearchParams } from "react-router-dom";

// const VerifyOtp = () => {
//   const navigate = useNavigate();
//   const [searchParams] = useSearchParams();

//   const email = searchParams.get("email");

//   const [otp, setOtp] = useState("");
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleVerify = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");

//     try {
//       const res = await fetch(
//         `${API_BASE}/api/customers/verify-otp`,
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ email, otp }),
//         }
//       );

//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message);

//       // ✅ OTP verified → go to reset password
//       navigate(`/reset-password?email=${email}`);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!email) {
//     return <p style={{ padding: "60px" }}>Invalid access</p>;
//   }

//   return (
//     <div className="auth-container">
//       <h1>Verify OTP</h1>
//       <p>Enter the OTP sent to your email</p>

//       <form onSubmit={handleVerify} className="auth-form">
//         <input
//           type="text"
//           placeholder="Enter 6-digit OTP"
//           value={otp}
//           onChange={(e) => setOtp(e.target.value)}
//           required
//         />

//         <button className="btn-primary" disabled={loading}>
//           {loading ? "Verifying..." : "Verify OTP"}
//         </button>

//         {error && <p className="auth-error">{error}</p>}
//       </form>
//     </div>
//   );
// };

// export default VerifyOtp;
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const VerifyOtp = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [notice, setNotice] = useState("");

  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  // ⏳ OTP timer
  useEffect(() => {
    if (timer === 0) {
      setCanResend(true);
      return;
    }
    const interval = setInterval(() => {
      setTimer((t) => t - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `${API_BASE}/api/customers/verify-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      navigate(`/reset-password?email=${email}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    if (resending) return;
    setResending(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch(
        `${API_BASE}/api/customers/forgot-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || "Could not resend the OTP");
      setCanResend(false);
      setTimer(30);
      setNotice("A new OTP has been sent to your email.");
    } catch (err) {
      setError(err.message || "Failed to resend OTP");
    } finally {
      setResending(false);
    }
  };

  if (!email) return <p style={{ padding: "60px" }}>Invalid access</p>;

  return (
    <div className="auth-container">
      <h1>Verify OTP</h1>
      <p>OTP sent to <strong>{email}</strong></p>

      <form onSubmit={handleVerify} className="auth-form">
        <input
          type="text"
          placeholder="Enter 6-digit OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
        />

        <button type="submit" className="btn-primary auth-btn" disabled={loading}>
          {loading ? "Verifying..." : "Verify OTP"}
        </button>

        {error && <p className="auth-error">{error}</p>}
        {notice && <p className="auth-success" role="status">{notice}</p>}
      </form>

      <div style={{ marginTop: "16px", textAlign: "center" }}>
        {canResend ? (
          <button type="button" className="btn-secondary" onClick={resendOtp} disabled={resending}>
            {resending ? "Sending…" : "Resend OTP"}
          </button>
        ) : (
          <p style={{ fontSize: "14px", color: "#6b7280" }}>
            Resend OTP in {timer}s
          </p>
        )}
      </div>
    </div>
  );
};

export default VerifyOtp;
