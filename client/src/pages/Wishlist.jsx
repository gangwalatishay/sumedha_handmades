import { API_BASE } from "../utils/api";
import { useContext } from "react";
import { WishlistContext } from "../context/WishlistContext";
import { CartContext } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import "../styles/wishlist.css";

const Wishlist = () => {
  const { wishlist, removeFromWishlist } = useContext(WishlistContext);
  const { addToCart } = useContext(CartContext);
  const toast = useToast();

  return (
    <div className="wishlist-container container">
      <div className="wishlist-header">
        <h1>My Wishlist</h1>
        <p>Your saved handmade favorites, all in one place.</p>
      </div>

      {wishlist.length === 0 ? (
        <div className="wishlist-empty">
          <span>💗</span>
          <p>Your wishlist is empty</p>
          <small>Save items you love to find them easily later.</small>
        </div>
      ) : (
        <div className="wishlist-grid">
          {wishlist.map((item) => (
            <div className="wishlist-card" key={item._id}>
              <img
                src={`${API_BASE}${item.image}`}
                alt={item.name}
                loading="lazy"
              />

              <div className="wishlist-info">
                <h3>{item.name}</h3>
                <p className="price">₹{item.price}</p>

                <div className="wishlist-actions">
                  <button
                    className="btn-primary"
                    onClick={() => { addToCart(item); toast.success(`${item.name} added to your cart.`); }}
                  >
                    Move to Cart
                  </button>

                  <button
                    className="btn-secondary"
                    onClick={async () => {
                      try {
                        await removeFromWishlist(item._id);
                        toast.success(`${item.name} removed from your wishlist.`);
                      } catch (error) {
                        toast.error(error.message || "Wishlist could not be updated.");
                      }
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
