import { API_BASE } from "../utils/api";
// // import { useState } from "react";
// // import { useNavigate, useLocation } from "react-router-dom";
// // import "../styles/auth.css";

// // const ResetPassword = () => {
// //   const navigate = useNavigate();
// //   const location = useLocation();

// //   const email = location.state?.email;

// //   const [password, setPassword] = useState("");
// //   const [confirm, setConfirm] = useState("");
// //   const [error, setError] = useState("");
// //   const [loading, setLoading] = useState(false);

// //   const handleReset = async (e) => {
// //     e.preventDefault();
// //     setError("");

// //     if (password !== confirm) {
// //       return setError("Passwords do not match");
// //     }

// //     setLoading(true);

// //     try {
// //       const res = await fetch(
// //         `${API_BASE}/api/customers/reset-password`,
// //         {
// //           method: "POST",
// //           headers: { "Content-Type": "application/json" },
// //           body: JSON.stringify({
// //             email,
// //             newPassword: password,
// //           }),
// //         }
// //       );

// //       const data = await res.json();
// //       if (!res.ok) throw new Error(data.message);

// //       alert("✅ Password reset successful");
// //       navigate("/login");
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
// //       <h1>Reset Password</h1>
// //       <p>Create a new password for <strong>{email}</strong></p>

// //       <form onSubmit={handleReset} className="auth-form">
// //         <input
// //           type="password"
// //           placeholder="New password"
// //           value={password}
// //           onChange={(e) => setPassword(e.target.value)}
// //           required
// //         />

// //         <input
// //           type="password"
// //           placeholder="Confirm password"
// //           value={confirm}
// //           onChange={(e) => setConfirm(e.target.value)}
// //           required
// //         />

// //         <button
// //           type="submit"
// //           className="btn-primary auth-btn"
// //           disabled={loading}
// //         >
// //           {loading ? "Updating..." : "Reset Password"}
// //         </button>

// //         {error && <p className="auth-error">{error}</p>}
// //       </form>
// //     </div>
// //   );
// // };

// // export default ResetPassword;
// import { useState } from "react";
// import { useNavigate, useLocation } from "react-router-dom";

// const ResetPassword = () => {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const email = location.state?.email;

//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleReset = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");

//     try {
//       const res = await fetch(
//         `${API_BASE}/api/customers/reset-password`,
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             email,
//             newPassword: password,
//           }),
//         }
//       );

//       const data = await res.json();

//       if (!res.ok) throw new Error(data.message);

//       alert("Password reset successful. Please login.");
//       navigate("/login");
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
//       <h1>Reset Password</h1>

//       <form onSubmit={handleReset} className="auth-form">
//         <input
//           type="password"
//           placeholder="New password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           required
//         />

//         <button className="btn-primary" disabled={loading}>
//           {loading ? "Updating..." : "Reset Password"}
//         </button>

//         {error && <p className="auth-error">{error}</p>}
//       </form>
//     </div>
//   );
// };

// export default ResetPassword;
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "../context/ToastContext";

const ResetPassword = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams] = useSearchParams();

  const email = searchParams.get("email");

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `${API_BASE}/api/customers/reset-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            newPassword: password,
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success("Password updated. Please log in with your new password.");
      navigate("/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!email) {
    return <p style={{ padding: "60px" }}>Invalid access</p>;
  }

  return (
    <div className="auth-container">
      <h1>Reset Password</h1>

      <form onSubmit={handleReset} className="auth-form">
        <input
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" className="btn-primary auth-btn" disabled={loading}>
          {loading ? "Updating..." : "Reset Password"}
        </button>

        {error && <p className="auth-error">{error}</p>}
      </form>
    </div>
  );
};

export default ResetPassword;
