import { API_BASE } from "../utils/api";
import {
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useParams,
  useNavigate,
} from "react-router-dom";

import {
  CartContext,
} from "../context/CartContext";

import {
  WishlistContext,
} from "../context/WishlistContext";

import ProductCard from "../components/ProductCard";
import { useToast } from "../context/ToastContext";
import { CustomerContext } from "../context/CustomerContext";

import "../styles/productDetails.css";

/* =========================================
   PRODUCT DETAILS
========================================= */

const ProductDetails = () => {

  const { id } =
    useParams();
  const navigate = useNavigate();
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

  const [
    product,
    setProduct,
  ] = useState(null);

  const [
    relatedProducts,
    setRelatedProducts,
  ] = useState([]);

  const [
    selectedMedia,
    setSelectedMedia,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  /* =====================================
     FETCH PRODUCT
  ===================================== */

  useEffect(() => {

    const fetchProduct =
      async () => {

        try {

          const res =
            await fetch(
              `${API_BASE}/api/products/${id}`
            );

          const data =
            await res.json();

          setProduct(data);

          /* RELATED */

          const relatedRes =
            await fetch(
              `${API_BASE}/api/products`
            );

          const relatedData =
            await relatedRes.json();

          setRelatedProducts(

            relatedData

              .filter(
                (item) =>
                  item._id !== id
              )

              .slice(0, 4)
          );

        } catch (err) {

          console.error(err);

        } finally {

          setLoading(false);
        }
      };

    fetchProduct();

  }, [id]);

  /* =====================================
     MEDIA
  ===================================== */

  const productMedia =
    useMemo(() => {

      if (!product)
        return [];

      if (
        product.media &&
        product.media.length > 0
      ) {

        return product.media.map(
          (item) => ({

            ...item,

            fullUrl:
              item.url?.startsWith(
                "http"
              )

                ? item.url

                : `${API_BASE}${item.url}`,
          })
        );
      }

      if (product.image) {

        return [

          {
            type: "image",

            fullUrl:
              product.image.startsWith(
                "http"
              )

                ? product.image

                : `${API_BASE}${product.image}`,
          },
        ];
      }

      return [];

    }, [product]);

  /* =====================================
     DEFAULT MEDIA
  ===================================== */

  useEffect(() => {

    if (
      productMedia.length > 0 &&
      !selectedMedia
    ) {

      setSelectedMedia(
        productMedia[0]
      );
    }

  }, [
    productMedia,
    selectedMedia,
  ]);

  /* =====================================
     WISHLIST
  ===================================== */

  const isWishlisted =
    wishlist.some(
      (item) =>
        item.productId === id
    );

  const toggleWishlist = async () => {

      if (!customer) {
        toast.info("Sign in to save items to your wishlist.");
        navigate("/login");
        return;
      }

      try {
        if (isWishlisted) {
          await removeFromWishlist(id);
          toast.success("Removed from your wishlist.");
        } else {
          await addToWishlist({
            productId: product._id,
            name: product.name,
            price: product.salePrice || product.price,
            image: selectedMedia?.fullUrl,
          });
          toast.success("Added to your wishlist.");
        }
      } catch (error) {
        toast.error(error.message || "Could not update your wishlist. Please try again.");
      }
    };

  /* =====================================
     ADD TO CART
  ===================================== */

  const handleAddToCart =
    () => {

      addToCart({

        productId:
          product._id,

        name:
          product.name,

        price:
          product.salePrice ||
          product.price,

        stock: product.stock,

        image:
          selectedMedia?.fullUrl,
      });
      toast.success(`${product.name} added to your cart.`);
    };

  /* =====================================
     LOADING
  ===================================== */

  if (loading) {

    return (
      <div className="pdp-loading">
        Loading Product...
      </div>
    );
  }

  if (!product) {

    return (
      <div className="pdp-loading">
        Product not found
      </div>
    );
  }

  return (
    <div className="premium-pdp">

      {/* =================================
         MAIN SECTION
      ================================= */}

      <div className="pdp-container">

        {/* =================================
           LEFT GALLERY
        ================================= */}

        <div className="pdp-gallery">

          {/* THUMBNAILS */}

          <div className="pdp-thumbnails">

            {productMedia.map(
              (item, index) => (

                <div
                  key={index}

                  className={
                    selectedMedia?.fullUrl ===
                    item.fullUrl

                      ? "pdp-thumb active"

                      : "pdp-thumb"
                  }

                  onClick={() =>
                    setSelectedMedia(
                      item
                    )
                  }
                >

                  {item.type ===
                  "video" ? (

                    <video muted>

                      <source
                        src={
                          item.fullUrl
                        }
                      />

                    </video>

                  ) : (

                    <img
                      src={
                        item.fullUrl
                      }

                      alt=""
                    />

                  )}

                </div>

              )
            )}

          </div>

          {/* MAIN MEDIA */}

          <div className="pdp-main-media">

            {selectedMedia?.type ===
            "video" ? (

              <video
                controls
                autoPlay
                muted
                loop
              >

                <source
                  src={
                    selectedMedia.fullUrl
                  }
                />

              </video>

            ) : (

              <img
                src={
                  selectedMedia?.fullUrl
                }

                alt={product.name}
              />

            )}

          </div>

        </div>

        {/* =================================
           PRODUCT INFO
        ================================= */}

        <div className="pdp-info">

          {/* BADGES */}

          <div className="pdp-badges">

            {product.featured && (

              <span>
                ✨ Featured
              </span>

            )}

            {product.bestseller && (

              <span>
                🔥 Bestseller
              </span>

            )}

            {product.trending && (

              <span>
                📈 Trending
              </span>

            )}

          </div>

          {/* TITLE */}

          <h1>
            {product.name}
          </h1>

          {/* RATING */}

          <div className="pdp-rating">

            ⭐
            {" "}
            {product.rating || 4.8}

            <span>

              (
              {product.reviewsCount || 0}
              {" "}
              reviews
              )

            </span>

          </div>

          {/* PRICE */}

          <div className="pdp-price">

            {product.salePrice && (

              <span className="old-price">
                ₹ {product.price}
              </span>

            )}

            <h2>

              ₹
              {" "}

              {product.salePrice ||
                product.price}

            </h2>

          </div>

          {/* STOCK */}

          <div
            className={
              product.stock > 0

                ? "pdp-stock in"

                : "pdp-stock out"
            }
          >

            {product.stock > 0

              ? `In Stock (${product.stock})`

              : "Out of Stock"}

          </div>

          {/* DESCRIPTION */}

          <div className="pdp-description">

            {product.description}

          </div>

          {/* CATEGORIES */}

          {product.categories?.length >
            0 && (

            <div className="pdp-categories">

              {product.categories.map(
                (category) => (

                  <span key={category}>
                    {category}
                  </span>

                )
              )}

            </div>

          )}

          {/* TRUST */}

          <div className="pdp-trust">

            <div>
              🚚 Free Shipping
            </div>

            <div>
              🔒 Secure Payment
            </div>

            <div>
              💝 Handmade Luxury
            </div>

          </div>

          {/* ACTIONS */}

          <div className="pdp-actions">

            <button
              type="button"
              className="pdp-cart-btn"

              onClick={
                handleAddToCart
              }

              disabled={
                product.stock <= 0
              }
            >

              {product.stock > 0

                ? "Add to Cart"

                : "Out of Stock"}

            </button>

            <button
              type="button"
              className={
                isWishlisted

                  ? "pdp-wishlist active"

                  : "pdp-wishlist"
              }

              onClick={
                toggleWishlist
              }
            >
              ♥ Wishlist
            </button>

          </div>

        </div>

      </div>

      {/* =================================
         RELATED PRODUCTS
      ================================= */}

      <section className="related-section">

        <div className="section-heading">

          <span>
            You May Also Love
          </span>

          <h2>
            Related Handmade Gifts
          </h2>

        </div>

        <div className="related-grid">

          {relatedProducts.map(
            (item) => (

              <ProductCard
                key={item._id}
                product={item}
              />

            )
          )}

        </div>

      </section>

    </div>
  );
};

export default ProductDetails;
