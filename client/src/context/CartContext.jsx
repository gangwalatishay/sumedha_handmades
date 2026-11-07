import { API_BASE } from "../utils/api";
import { createContext, useContext, useEffect, useState } from "react";
import { CustomerContext } from "./CustomerContext";

export const CartContext = createContext();

const CartProvider = ({ children }) => {
  const { customer } = useContext(CustomerContext);
  const [cartItems, setCartItems] = useState([]);

  // 🔄 Load cart from DB on login
  useEffect(() => {
    if (!customer) {
      setCartItems([]);
      return;
    }

    fetch(`${API_BASE}/api/cart/${customer.id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((data) => setCartItems(data));
  }, [customer]);

  // 🔄 Sync cart to DB
  const syncCart = async (updatedCart) => {
    if (!customer) return;

    await fetch(`${API_BASE}/api/cart/sync`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        customerId: customer.id,
        cart: updatedCart,
      }),
    });
  };

  const addToCart = (product) => {
    setCartItems((prev) => {
      const available = Number.isFinite(Number(product.stock)) ? Number(product.stock) : 20;
      if (available < 1) return prev;
      const exists = prev.find(
        (item) => item.productId === product.productId
      );

      let updated;
      if (exists) {
        if (exists.qty >= available) return prev;
        updated = prev.map((item) =>
          item.productId === product.productId
            ? { ...item, stock: available, qty: item.qty + 1 }
            : item
        );
      } else {
        updated = [...prev, { ...product, stock: available, qty: 1 }];
      }

      syncCart(updated);
      return updated;
    });
  };

  const removeFromCart = (productId) => {
    setCartItems((prev) => {
      const updated = prev.filter(
        (item) => item.productId !== productId
      );
      syncCart(updated);
      return updated;
    });
  };

  return (
    <CartContext.Provider
      value={{ cartItems, addToCart, removeFromCart, setCartItems }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartProvider;
