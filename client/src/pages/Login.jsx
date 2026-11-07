import { API_BASE } from "../utils/api";
// // // import { useState, useContext } from "react";
// // // import { useNavigate } from "react-router-dom";
// // // import { CustomerContext } from "../context/CustomerContext";
// // // import "../styles/auth.css";

// // // const Login = () => {
// // //   const { login } = useContext(CustomerContext);
// // //   const navigate = useNavigate();

// // //   const [form, setForm] = useState({
// // //     email: "",
// // //     password: "",
// // //   });

// // //   const [error, setError] = useState("");

// // //   const handleChange = (e) => {
// // //     setForm({ ...form, [e.target.name]: e.target.value });
// // //   };

// // //   const handleSubmit = async (e) => {
// // //     e.preventDefault();
// // //     setError("");

// // //     try {
// // //       const res = await fetch(
// // //         `${API_BASE}/api/customers/login`,
// // //         {
// // //           method: "POST",
// // //           headers: { "Content-Type": "application/json" },
// // //           body: JSON.stringify(form),
// // //         }
// // //       );

// // //       const data = await res.json();

// // //       if (!res.ok) {
// // //         throw new Error(data.message || "Login failed");
// // //       }

// // //       // ✅ Save customer in context
// // //       login(data.customer);

// // //       navigate("/");
// // //     } catch (err) {
// // //       setError(err.message);
// // //     }
// // //   };

// // //   return (
// // //     <div className="auth-container">
// // //       <h1>Welcome Back</h1>
// // //       <p>Login to continue shopping handmade creations.</p>

// // //       <form onSubmit={handleSubmit} className="auth-form">
// // //         <input
// // //           type="email"
// // //           name="email"
// // //           placeholder="Email"
// // //           value={form.email}
// // //           onChange={handleChange}
// // //           required
// // //         />

// // //         <input
// // //           type="password"
// // //           name="password"
// // //           placeholder="Password"
// // //           value={form.password}
// // //           onChange={handleChange}
// // //           required
// // //         />

// // //         <button type="submit" className="btn-primary auth-btn">
// // //           Login
// // //         </button>

// // //         {error && <p className="auth-error">{error}</p>}
// // //       </form>

// // //       {/* 🔽 BELOW FORM ACTIONS */}
// // //       <div className="auth-links">
// // //         <button
// // //           className="btn-secondary"
// // //           onClick={() => navigate("/signup")}
// // //         >
// // //           New here? Create Account
// // //         </button>
// // //       </div>
// // //     </div>
// // //   );
// // // };

// // // export default Login;
// // import { useState, useContext } from "react";
// // import { useNavigate } from "react-router-dom";
// // import { CustomerContext } from "../context/CustomerContext";
// // import "../styles/auth.css";

// // const Login = () => {
// //   const { login } = useContext(CustomerContext);
// //   const navigate = useNavigate();

// //   const [form, setForm] = useState({
// //     email: "",
// //     password: "",
// //   });

// //   const [error, setError] = useState("");

// //   const handleChange = (e) =>
// //     setForm({ ...form, [e.target.name]: e.target.value });

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();

// //     try {
// //       const res = await fetch(`${API_BASE}/api/customers/login`, {
// //         method: "POST",
// //         headers: { "Content-Type": "application/json" },
// //         body: JSON.stringify(form),
// //       });

// //       const data = await res.json();
// //       if (!res.ok) throw new Error(data.message);

// //       login(data.customer);
// //       navigate("/");
// //     } catch (err) {
// //       setError(err.message);
// //     }
// //   };

// //   return (
// //     <div className="auth-container">
// //       <h1>Welcome Back</h1>
// //       <p>Login to continue shopping handmade creations.</p>

// //       <form onSubmit={handleSubmit} className="auth-form">
// //         <input
// //           type="email"
// //           name="email"
// //           placeholder="Email"
// //           required
// //           onChange={handleChange}
// //         />

// //         <input
// //           type="password"
// //           name="password"
// //           placeholder="Password"
// //           required
// //           onChange={handleChange}
// //         />

// //         <button type="submit" className="btn-primary auth-btn">
// //           Login
// //         </button>

// //         {error && <p className="auth-error">{error}</p>}
// //       </form>

// //       {/* 🔽 EXTRA ACTIONS */}
// //       <div className="auth-links">
// //         <button
// //           className="btn-secondary"
// //           onClick={() => navigate("/forgot-password")}
// //         >
// //           Forgot Password?
// //         </button>

// //         <button
// //           className="btn-secondary"
// //           onClick={() => navigate("/signup")}
// //         >
// //           New here? Create Account
// //         </button>
// //         <button
// //   className="btn-secondary"
// //   onClick={() => navigate("/forgot-password")}
// // >
// //   Forgot Password?
// // </button>

// //       </div>
// //     </div>
// //   );
// // };

// // export default Login;
// import { useState, useContext } from "react";
// import { useNavigate } from "react-router-dom";
// import { CustomerContext } from "../context/CustomerContext";
// import "../styles/auth.css";

// const Login = () => {
//   const { login } = useContext(CustomerContext);
//   const navigate = useNavigate();

//   const [form, setForm] = useState({
//     email: "",
//     password: "",
//   });

//   const [error, setError] = useState("");

//   const handleChange = (e) =>
//     setForm({ ...form, [e.target.name]: e.target.value });

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");

//     try {
//       const res = await fetch(`${API_BASE}/api/customers/login`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(form),
//       });

//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || "Login failed");

//       // ✅ STEP 1.7 — STORE TOKEN + CUSTOMER
//       localStorage.setItem("token", data.token);
//       localStorage.setItem("customer", JSON.stringify(data.customer));

//       login(data.customer);
//       navigate("/");
//     } catch (err) {
//       setError(err.message);
//     }
//   };

//   return (
//     <div className="auth-container">
//       <h1>Welcome Back</h1>
//       <p>Login to continue shopping handmade creations.</p>

//       <form onSubmit={handleSubmit} className="auth-form">
//         <input
//           type="email"
//           name="email"
//           placeholder="Email"
//           value={form.email}
//           onChange={handleChange}
//           required
//         />

//         <input
//           type="password"
//           name="password"
//           placeholder="Password"
//           value={form.password}
//           onChange={handleChange}
//           required
//         />

//         <button type="submit" className="btn-primary auth-btn">
//           Login
//         </button>

//         {error && <p className="auth-error">{error}</p>}
//       </form>

//       {/* 🔽 EXTRA ACTIONS */}
//       <div className="auth-links">
//         <button
//           className="btn-secondary"
//           onClick={() => navigate("/forgot-password")}
//         >
//           Forgot Password?
//         </button>

//         <button
//           className="btn-secondary"
//           onClick={() => navigate("/signup")}
//         >
//           New here? Create Account
//         </button>
//       </div>
//     </div>
//   );
// };

// export default Login;
import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CustomerContext } from "../context/CustomerContext";
import "../styles/auth.css";

const Login = () => {
  const { login } = useContext(CustomerContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/customers/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");

      // ✅ STORE TOKEN + CUSTOMER
      localStorage.setItem("token", data.token);
      localStorage.setItem("customer", JSON.stringify(data.customer));

      login(data.customer);
      navigate("/");
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h1>Welcome Back</h1>
      <p>Login to continue shopping handmade creations.</p>

      <form onSubmit={handleSubmit} className="auth-form">
        <input
          type="email"
          name="email"
          placeholder="Email"
          required
          onChange={handleChange}
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          required
          onChange={handleChange}
        />

        <button type="submit" className="btn-primary auth-btn" disabled={loading}>
          {loading ? "Signing in…" : "Login"}
        </button>

        {error && <p className="auth-error">{error}</p>}
      </form>

      <div className="auth-links">
        <button
          className="btn-secondary"
          onClick={() => navigate("/forgot-password")}
        >
          Forgot Password?
        </button>

        <button
          className="btn-secondary"
          onClick={() => navigate("/signup")}
        >
          New here? Create Account
        </button>
      </div>
    </div>
  );
};

export default Login;
