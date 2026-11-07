// // // // import { createContext, useState } from "react";

// // // // export const CustomerContext = createContext();

// // // // const CustomerProvider = ({ children }) => {
// // // //   const [customer, setCustomer] = useState(
// // // //     JSON.parse(localStorage.getItem("customer")) || null
// // // //   );

// // // //   const login = (customerData) => {
// // // //     setCustomer(customerData);
// // // //     localStorage.setItem("customer", JSON.stringify(customerData));
// // // //   };

// // // //   const logout = () => {
// // // //     setCustomer(null);
// // // //     localStorage.removeItem("customer");
// // // //   };

// // // //   return (
// // // //     <CustomerContext.Provider value={{ customer, login, logout }}>
// // // //       {children}
// // // //     </CustomerContext.Provider>
// // // //   );
// // // // };

// // // // export default CustomerProvider;
// // // import { createContext, useState, useEffect } from "react";

// // // export const CustomerContext = createContext();

// // // const CustomerProvider = ({ children }) => {
// // //   const [customer, setCustomer] = useState(null);

// // //   // 🔄 AUTO LOGIN ON REFRESH
// // //   useEffect(() => {
// // //     const token = localStorage.getItem("token");
// // //     const storedCustomer = localStorage.getItem("customer");

// // //     if (token && storedCustomer) {
// // //       setCustomer(JSON.parse(storedCustomer));
// // //     }
// // //   }, []);

// // //   const login = (customerData) => {
// // //     setCustomer(customerData);
// // //     localStorage.setItem("customer", JSON.stringify(customerData));
// // //   };

// // //   const logout = () => {
// // //     setCustomer(null);
// // //     localStorage.removeItem("token");
// // //     localStorage.removeItem("customer");
// // //   };

// // //   return (
// // //     <CustomerContext.Provider
// // //       value={{ customer, login, logout }}
// // //     >
// // //       {children}
// // //     </CustomerContext.Provider>
// // //   );
// // // };

// // // export default CustomerProvider;
// // import { createContext, useState, useEffect } from "react";

// // export const CustomerContext = createContext();

// // const CustomerProvider = ({ children }) => {
// //   const [customer, setCustomer] = useState(null);

// //   // ✅ AUTO LOGIN ON REFRESH
// //   useEffect(() => {
// //     const token = localStorage.getItem("token");
// //     const storedCustomer = localStorage.getItem("customer");

// //     if (token && storedCustomer) {
// //       try {
// //         setCustomer(JSON.parse(storedCustomer));
// //       } catch {
// //         localStorage.clear();
// //       }
// //     }
// //   }, []);

// //   const login = (customerData) => {
// //     setCustomer(customerData);
// //   };

// //   const logout = () => {
// //     localStorage.removeItem("token");
// //     localStorage.removeItem("customer");
// //     setCustomer(null);
// //   };

// //   return (
// //     <CustomerContext.Provider value={{ customer, login, logout }}>
// //       {children}
// //     </CustomerContext.Provider>
// //   );
// // };

// // export default CustomerProvider;
// import { useState, useContext } from "react";
// import { useNavigate } from "react-router-dom";
// import { CustomerContext } from "../context/CustomerContext";
// import "../styles/auth.css";

// const Signup = () => {
//   const navigate = useNavigate();
//   const { login } = useContext(CustomerContext);

//   const [form, setForm] = useState({
//     name: "",
//     email: "",
//     password: "",
//     phone: "",
//   });

//   const [error, setError] = useState("");

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");

//     try {
//       const res = await fetch(
//         `${API_BASE}/api/customers/register`,
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify(form),
//         }
//       );

//       const data = await res.json();

//       if (!res.ok) {
//         throw new Error(data.message || "Signup failed");
//       }

//       // ✅ AUTO LOGIN AFTER SIGNUP
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
//       <h1>Create Account</h1>
//       <p>Join Sumedha Handmade to explore beautiful creations.</p>

//       <form onSubmit={handleSubmit} className="auth-form">
//         <input
//           name="name"
//           placeholder="Name"
//           value={form.name}
//           onChange={handleChange}
//           required
//         />

//         <input
//           name="email"
//           type="email"
//           placeholder="Email"
//           value={form.email}
//           onChange={handleChange}
//           required
//         />

//         <input
//           name="password"
//           type="password"
//           placeholder="Password"
//           value={form.password}
//           onChange={handleChange}
//           required
//         />

//         <input
//           name="phone"
//           placeholder="Phone (optional)"
//           value={form.phone}
//           onChange={handleChange}
//         />

//         <button type="submit" className="btn-primary auth-btn">
//           Sign Up
//         </button>

//         {error && <p className="auth-error">{error}</p>}
//       </form>

//       <div className="auth-links">
//         <button
//           className="btn-secondary"
//           onClick={() => navigate("/login")}
//         >
//           Already have an account? Login
//         </button>
//       </div>
//     </div>
//   );
// };

// export default Signup;
import { createContext, useState, useEffect } from "react";

/* ======================================
   👤 CUSTOMER CONTEXT
====================================== */
export const CustomerContext = createContext(null);

const CustomerProvider = ({ children }) => {
  const [customer, setCustomer] = useState(null);

  /* ==============================
     🔐 LOGIN
  ============================== */
  const login = (customerData) => {
    setCustomer(customerData);
    localStorage.setItem("customer", JSON.stringify(customerData));
  };

  /* ==============================
     🚪 LOGOUT
  ============================== */
  const logout = () => {
    setCustomer(null);
    localStorage.removeItem("customer");
    localStorage.removeItem("token");
  };

  /* ==============================
     🔄 AUTO LOGIN ON REFRESH
  ============================== */
  useEffect(() => {
    const storedCustomer = localStorage.getItem("customer");
    if (storedCustomer) {
      setCustomer(JSON.parse(storedCustomer));
    }
  }, []);

  return (
    <CustomerContext.Provider
      value={{
        customer,
        login,
        logout,
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
};

export default CustomerProvider;
