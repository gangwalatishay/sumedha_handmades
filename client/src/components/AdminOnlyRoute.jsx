import { Navigate } from "react-router-dom";

const AdminOnlyRoute = ({ children }) => {
  try {
    /* ✅ GET TOKEN */
    const token = localStorage.getItem("token");

    if (!token) {
      return <Navigate to="/admin-login" replace />;
    }

    /* ✅ DECODE JWT */
    const payload = JSON.parse(
      atob(token.split(".")[1])
    );

    /* ✅ CHECK ADMIN */
    if (!payload.isAdmin) {
      return <Navigate to="/" replace />;
    }

    return children;

  } catch (err) {
    console.error("Admin auth failed:", err);

    localStorage.removeItem("token");
    localStorage.removeItem("customer");

    return <Navigate to="/admin-login" replace />;
  }
};

export default AdminOnlyRoute;