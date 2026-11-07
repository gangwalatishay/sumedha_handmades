import { API_BASE } from "../utils/api";
import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import "../styles/adminProducts.css";

const AdminProducts = () => {

  const navigate =
    useNavigate();
  const [searchParams] = useSearchParams();
  const lowStockOnly = searchParams.get("filter") === "low-stock";

  const [
    products,
    setProducts,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    message,
    setMessage,
  ] = useState("");

  const [
    search,
    setSearch,
  ] = useState("");

  /* =====================================
     FETCH PRODUCTS
  ===================================== */

  const fetchProducts =
    async () => {

      try {

        const res =
          await fetch(
            `${API_BASE}/api/products`
          );

        const data =
          await res.json();

        setProducts(data);

      } catch (err) {

        console.error(err);

      } finally {

        setLoading(false);
      }
    };

  useEffect(() => {

    fetchProducts();

  }, []);

  /* =====================================
     DELETE PRODUCT
  ===================================== */

  const deleteProduct =
    async (id) => {

      const confirmDelete =
        window.confirm(
          "Delete this product?"
        );

      if (!confirmDelete)
        return;

      try {

        const token =
          localStorage.getItem(
            "token"
          );

        const res =
          await fetch(
            `${API_BASE}/api/products/${id}`,
            {
              method: "DELETE",

              headers: {
                Authorization:
                  "Bearer " + token,
              },
            }
          );

        const data =
          await res.json();

        if (!res.ok) {

          throw new Error(
            data.message
          );
        }

        setMessage(
          "✅ Product deleted successfully"
        );

        fetchProducts();

      } catch (err) {

        console.error(err);

        setMessage(
          "❌ Failed to delete product"
        );
      }
    };

  /* =====================================
     FILTERED PRODUCTS
  ===================================== */

  const filteredProducts =
    products.filter(
      (product) =>
        (!lowStockOnly || Number(product.stock) <= 5) &&
        product.name
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          )
    );

  /* =====================================
     LOADING
  ===================================== */

  if (loading) {

    return (
      <p className="admin-products-status">
        Loading products...
      </p>
    );
  }

  return (
    <div className="admin-products-page">

      {/* =================================
         HEADER
      ================================= */}

      <div className="admin-products-header">

        <div>

          <span>
            ✨ Admin Dashboard
          </span>

          <h1>
            Manage Products
          </h1>

          <p>
            Edit, organize and manage
            your handmade collections
            beautifully.
          </p>

        </div>

        <button
          className="add-product-btn"

          onClick={() =>
            navigate("/admin")
          }
        >
          + Add Product
        </button>

      </div>

      {/* =================================
         SEARCH
      ================================= */}

      <div className="admin-search-wrapper">

        <input
          type="text"

          placeholder="
            Search products...
          "

          value={search}

          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
        />

      </div>

      {lowStockOnly && <p className="admin-stock-filter-note">Showing products with 5 or fewer in stock. <button type="button" onClick={() => navigate("/admin/products")}>Show all products</button></p>}

      {/* =================================
         MESSAGE
      ================================= */}

      {message && (

        <div className="admin-products-message">
          {message}
        </div>

      )}

      {/* =================================
         EMPTY STATE
      ================================= */}

      {filteredProducts.length ===
      0 ? (

        <div className="empty-admin-products">

          <h2>
            No Products Found
          </h2>

          <p>
            Try adding new handmade
            products to your store.
          </p>

        </div>

      ) : (

        <div className="admin-products-grid">

          {filteredProducts.map(
            (product) => {

              /* IMAGE */

              const primaryImage =

                product.media?.find(
                  (item) =>
                    item.type ===
                    "image"
                )?.url ||

                product.image ||

                "";

              const imageUrl =
                primaryImage?.startsWith(
                  "http"
                )

                  ? primaryImage

                  : `${API_BASE}${primaryImage}`;

              return (

                <div
                  className="admin-product-card"
                  key={product._id}
                >

                  {/* IMAGE */}

                  <div className="admin-product-image">

                    <img
                      src={imageUrl}

                      alt={
                        product.name
                      }
                    />

                  </div>

                  {/* CONTENT */}

                  <div className="admin-product-content">

                    {/* TOP */}

                    <div className="admin-top">

                      <h3>
                        {product.name}
                      </h3>

                      <p>

                        ₹
                        {" "}

                        {product.salePrice ||
                          product.price}

                      </p>

                    </div>

                    {/* DESCRIPTION */}

                    <div className="admin-description">

                      {product.description
                        ?.slice(0, 100)}

                      ...

                    </div>

                    {/* BADGES */}

                    <div className="admin-badges">

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

                    {/* STOCK */}

                    <div
                      className={
                        product.stock > 0

                          ? "admin-stock in"

                          : "admin-stock out"
                      }
                    >

                      {product.stock > 0

                        ? `In Stock (${product.stock})`

                        : "Out of Stock"}

                    </div>

                    {/* CATEGORIES */}

                    {product.categories
                      ?.length > 0 && (

                      <div className="admin-categories">

                        {product.categories.map(
                          (category) => (

                            <span
                              key={category}
                            >
                              {category}
                            </span>

                          )
                        )}

                      </div>

                    )}

                    {/* ACTIONS */}

                    <div className="admin-actions">

                      <button
                        className="edit-btn"

                        onClick={() =>
                          navigate(
                            `/admin/products/edit/${product._id}`
                          )
                        }
                      >
                        Edit
                      </button>

                      <button
                        className="delete-btn"

                        onClick={() =>
                          deleteProduct(
                            product._id
                          )
                        }
                      >
                        Delete
                      </button>

                    </div>

                  </div>

                </div>

              );
            }
          )}

        </div>

      )}

    </div>
  );
};

export default AdminProducts;
