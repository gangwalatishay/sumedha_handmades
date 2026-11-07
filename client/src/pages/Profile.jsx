import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CustomerContext } from "../context/CustomerContext";
import "../styles/profile.css";

const Profile = () => {
  const { customer, logout } = useContext(CustomerContext);
  const navigate = useNavigate();

  return (
    <div className="profile-container container">
      <div className="profile-card">
        <h1>
          Hi, <span>{customer?.name}</span>
        </h1>

        <p className="profile-subtitle">
          Manage your handmade journey ✨
        </p>

        <div className="profile-actions">
          <button
            className="btn-secondary"
            onClick={() => navigate("/orders")}
          >
            📦 My Orders
          </button>

          <button
            className="btn-secondary"
            onClick={() => navigate("/wishlist")}
          >
            ❤️ My Wishlist
          </button>

          <button
            className="btn-secondary"
            onClick={() => navigate("/cart")}
          >
            🛒 My Cart
          </button>
        </div>

        <div className="profile-divider"></div>

        <button
          className="profile-logout"
          onClick={() => {
            logout();
            navigate("/");
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Profile;
