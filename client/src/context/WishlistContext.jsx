import { API_BASE } from "../utils/api";
import { createContext, useContext, useEffect, useState } from "react";
import { CustomerContext } from "./CustomerContext";

export const WishlistContext = createContext();

const WishlistProvider = ({ children }) => {
  const { customer } = useContext(CustomerContext);
  const [wishlist, setWishlist] = useState([]);

  // 🔄 Load wishlist from DB on login
  useEffect(() => {
    if (!customer) {
      setWishlist([]);
      return;
    }

    fetch(`${API_BASE}/api/wishlist/${customer.id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Could not load wishlist");
        return res.json();
      })
      .then((data) => setWishlist(Array.isArray(data) ? data : []))
      .catch(() => setWishlist([]));
  }, [customer]);

  const addToWishlist = async (product) => {
    if (!customer) return;

    const response = await fetch(`${API_BASE}/api/wishlist/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        customerId: customer.id,
        product,
      }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.message || "Could not add item to wishlist.");
    }

    setWishlist((prev) => prev.some((item) => item.productId === product.productId) ? prev : [...prev, product]);
  };

  const removeFromWishlist = async (productId) => {
    const response = await fetch(`${API_BASE}/api/wishlist/remove`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        customerId: customer.id,
        productId,
      }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.message || "Could not remove item from wishlist.");
    }

    setWishlist((prev) =>
      prev.filter((item) => item.productId !== productId)
    );
  };

  return (
    <WishlistContext.Provider
      value={{ wishlist, addToWishlist, removeFromWishlist }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export default WishlistProvider;
