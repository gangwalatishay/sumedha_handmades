import { API_BASE } from "../utils/api";
import { useContext } from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  CartContext,
} from "../context/CartContext";

import {
  WishlistContext,
} from "../context/WishlistContext";
import { CustomerContext } from "../context/CustomerContext";
import { useToast } from "../context/ToastContext";

import "../styles/productCard.css";

const ProductCard = ({ product }) => {

  const navigate =
    useNavigate();
  const toast = useToast();
  const { customer } = useContext(CustomerContext);

  const {
    addToCart,
  } = useContext(CartContext);

  const {
    wishlist,
    addToWishlist,
    removeFromWishlist,
  } = useContext(WishlistContext);

  /* =====================================
     PRODUCT DATA
  ===================================== */

  const {
    _id,
    name,
    price,
    salePrice,
    image,
    media,
    stock,
    featured,
    bestseller,
    trending,
    rating,
  } = product;

  /* =====================================
     IMAGE HANDLING
  ===================================== */

  const primaryImage =

    media?.find(
      (item) =>
        item.type === "image"
    )?.url ||

    image ||

    "";

  const imageUrl =
    primaryImage?.startsWith(
      "http"
    )

      ? primaryImage

      : `${API_BASE}${primaryImage}`;

  /* =====================================
     WISHLIST CHECK
  ===================================== */

  const isWishlisted =
    wishlist.some(
      (item) =>
        item.productId === _id
    );

  /* =====================================
     WISHLIST TOGGLE
  ===================================== */

  const handleWishlist = async () => {
    if (!customer) {
      toast.info("Log in to save items to your wishlist.");
      navigate("/login");
      return;
    }
    try {
      if (isWishlisted) {
        await removeFromWishlist(_id);
        toast.success(`${name} removed from your wishlist.`);
      } else {
        await addToWishlist({ productId: _id, name, price: salePrice || price, image: imageUrl });
        toast.success(`${name} saved to your wishlist.`);
      }
    } catch (error) {
      toast.error(error.message || "Wishlist could not be updated. Please try again.");
    }
  };

  /* =====================================
     ADD TO CART
  ===================================== */

  const handleAddToCart = () => {
    if (stock <= 0) {
      toast.info("This item is currently out of stock.");
      return;
    }
    addToCart({
      productId: _id,

      name,

      price:
        salePrice || price,

      stock,

      image:
        imageUrl,
    });
    toast.success(`${name} added to your cart.`);
  };

  return (
    <div
      className="lux-product-card"

      onClick={() =>
        navigate(
          `/product/${_id}`
        )
      }
    >

      {/* =================================
         TOP BADGES
      ================================= */}

      <div className="product-top-badges">

        {featured && (

          <div className="featured-badge">
            ✨ Featured
          </div>

        )}

        {bestseller && (

          <div className="bestseller-badge">
            🔥 Bestseller
          </div>

        )}

        {trending && (

          <div className="trending-badge">
            ✨ Trending
          </div>

        )}

      </div>

      {/* =================================
         WISHLIST
      ================================= */}

      <button
        className={
          isWishlisted

            ? "wishlist-btn active"

            : "wishlist-btn"
        }

        onClick={(e) => {

          e.stopPropagation();

          handleWishlist();
        }}
      >
        ♥
      </button>

      {/* =================================
         IMAGE
      ================================= */}

      <div className="product-image-wrapper">

        <img
          src={imageUrl}

          alt={name}

          className="product-img"
        />

      </div>

      {/* =================================
         PRODUCT INFO
      ================================= */}

      <div className="product-info">

        {/* RATING */}

        <div className="product-rating">
          ⭐ {rating || 4.8}
        </div>

        {/* NAME */}

        <h3>
          {name}
        </h3>

        {/* PRICE */}

        <div className="product-bottom">

          <div className="product-pricing">

            {salePrice && (

              <span className="old-price">
                ₹ {price}
              </span>

            )}

            <p className="price">

              ₹ {salePrice || price}

            </p>

          </div>

          {/* STOCK */}

          <span
            className={
              stock > 0

                ? "stock in-stock"

                : "stock out-stock"
            }
          >

            {stock > 0

              ? "In Stock"

              : "Out of Stock"}

          </span>

        </div>

        {/* BUTTON */}

        <button
          className="lux-cart-btn"

          onClick={(e) => {

            e.stopPropagation();

            handleAddToCart();
          }}

          disabled={stock <= 0}
        >

          {stock > 0

            ? "Add to Cart"

            : "Out of Stock"}

        </button>

      </div>

    </div>
  );
};

export default ProductCard;
