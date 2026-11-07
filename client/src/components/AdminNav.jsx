import { NavLink, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { CustomerContext } from "../context/CustomerContext";
import "../styles/adminNav.css";

const AdminNav = () => {
  const navigate = useNavigate();
  const { logout } = useContext(CustomerContext);
  const links = [
    ["Overview", "/admin-panel"],
    ["Orders", "/admin/orders"],
    ["Products", "/admin/products"],
    ["Coupons", "/admin/coupons"],
    ["Add product", "/admin"],
    ["Analytics", "/admin/analytics"],
    ["Invoices", "/admin/invoices"],
    ["Payments", "/admin/payments"],
  ];

  const signOut = () => {
    logout();
    navigate("/admin-login", { replace: true });
  };

  return (
    <header className="admin-nav">
      <NavLink to="/admin-panel" className="admin-brand">Sumedha <span>ADMIN</span></NavLink>
      <nav aria-label="Admin navigation">
        {links.map(([label, to]) => <NavLink key={to} to={to} end={to === "/admin" || to === "/admin-panel"} className={({ isActive }) => isActive ? "admin-nav-link active" : "admin-nav-link"}>{label}</NavLink>)}
      </nav>
      <button type="button" className="admin-signout" onClick={signOut}>Sign out</button>
    </header>
  );
};

export default AdminNav;
