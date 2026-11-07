import { API_BASE } from "../utils/api";
import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import "../styles/admin.css";

/* =========================================
   GIFT CATEGORIES
========================================= */

const GIFT_CATEGORIES = [

  "birthday",

  "anniversary",

  "wedding",

  "long-distance",

  "love",

  "surprise",

  "apology",

  "proposal",

  "friendship",

  "baby",
];

/* =========================================
   EDIT PRODUCT PAGE
========================================= */

const EditProduct = () => {

  const navigate =
    useNavigate();

  const { id } =
    useParams();

  const [form, setForm] =
    useState({

      name: "",

      price: "",

      salePrice: "",

      stock: "",

      image: "",

      description: "",

      featured: false,

      bestseller: false,

      trending: false,

      categories: [],
    });

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  /* =====================================
     FETCH PRODUCT
  ===================================== */

  useEffect(() => {

    fetch(
      `${API_BASE}/api/products/${id}`
    )

      .then((res) =>
        res.json()
      )

      .then((data) => {

        setForm({

          name:
            data.name || "",

          price:
            data.price || "",

          salePrice:
            data.salePrice || "",

          stock:
            data.stock || "",

          image:
            data.image || "",

          description:
            data.description || "",

          featured:
            data.featured || false,

          bestseller:
            data.bestseller || false,

          trending:
            data.trending || false,

          categories:
            data.categories || [],
        });

        setLoading(false);
      })

      .catch((err) => {

        console.error(err);

        setLoading(false);
      });

  }, [id]);

  /* =====================================
     INPUT CHANGE
  ===================================== */

  const handleChange = (e) => {

    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setForm({

      ...form,

      [name]:
        type === "checkbox"
          ? checked
          : value,
    });
  };

  /* =====================================
     CATEGORY TOGGLE
  ===================================== */

  const toggleCategory =
    (category) => {

      setForm((prev) => {

        const exists =
          prev.categories.includes(
            category
          );

        return {

          ...prev,

          categories:
            exists

              ? prev.categories.filter(
                  (c) =>
                    c !== category
                )

              : [
                  ...prev.categories,
                  category,
                ],
        };
      });
    };

  /* =====================================
     UPDATE PRODUCT
  ===================================== */

  const handleSubmit =
    async (e) => {

      e.preventDefault();

      setSaving(true);

      setMessage("");

      try {

        const token =
          localStorage.getItem(
            "token"
          );

        const res =
          await fetch(
            `${API_BASE}/api/products/${id}`,
            {
              method: "PUT",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  "Bearer " + token,
              },

              body: JSON.stringify({

                ...form,

                price:
                  Number(
                    form.price
                  ),

                salePrice:
                  form.salePrice

                    ? Number(
                        form.salePrice
                      )

                    : null,

                stock:
                  Number(
                    form.stock
                  ),
              }),
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
          "✅ Product updated successfully"
        );

      } catch (err) {

        console.error(err);

        setMessage(
          "❌ Failed to update product"
        );

      } finally {

        setSaving(false);
      }
    };

  /* =====================================
     LOADING
  ===================================== */

  if (loading) {

    return (
      <p className="admin-products-status">
        Loading product...
      </p>
    );
  }

  return (
    <div className="admin-page">

      <div className="admin-card">

        {/* HEADER */}

        <div className="admin-header">

          <span>
            ✨ Product Editor
          </span>

          <h1>
            Edit Product
          </h1>

          <p>
            Update your handmade product
            information beautifully and
            keep your storefront curated.
          </p>

        </div>

        {/* FORM */}

        <form
          className="admin-form"
          onSubmit={handleSubmit}
        >

          {/* NAME */}

          <input
            type="text"

            name="name"

            placeholder="
              Product Name
            "

            value={form.name}

            onChange={handleChange}

            required
          />

          {/* PRICE */}

          <input
            type="number"

            name="price"

            placeholder="
              Original Price
            "

            value={form.price}

            onChange={handleChange}

            required
          />

          {/* SALE PRICE */}

          <input
            type="number"

            name="salePrice"

            placeholder="
              Sale Price
            "

            value={form.salePrice}

            onChange={handleChange}
          />

          {/* STOCK */}

          <input
            type="number"

            name="stock"

            placeholder="
              Available Stock
            "

            value={form.stock}

            onChange={handleChange}
          />

          {/* IMAGE */}

          <input
            type="text"

            name="image"

            placeholder="
              Product Image URL
            "

            value={form.image}

            onChange={handleChange}
          />

          {/* DESCRIPTION */}

          <textarea
            name="description"

            placeholder="
              Product Description
            "

            value={form.description}

            onChange={handleChange}
          />

          {/* TOGGLES */}

          <div className="admin-checkboxes">

            <label className="checkbox-label">

              <input
                type="checkbox"

                name="featured"

                checked={
                  form.featured
                }

                onChange={
                  handleChange
                }
              />

              Featured Product

            </label>

            <label className="checkbox-label">

              <input
                type="checkbox"

                name="bestseller"

                checked={
                  form.bestseller
                }

                onChange={
                  handleChange
                }
              />

              Bestseller Product

            </label>

            <label className="checkbox-label">

              <input
                type="checkbox"

                name="trending"

                checked={
                  form.trending
                }

                onChange={
                  handleChange
                }
              />

              Trending Product

            </label>

          </div>

          {/* CATEGORIES */}

          <div className="gift-category-group">

            <p>
              Gift Categories
            </p>

            <div className="gift-options">

              {GIFT_CATEGORIES.map(
                (category) => (

                  <button
                    key={category}

                    type="button"

                    className={
                      form.categories.includes(
                        category
                      )

                        ? "gift-chip active"

                        : "gift-chip"
                    }

                    onClick={() =>
                      toggleCategory(
                        category
                      )
                    }
                  >
                    {category}
                  </button>

                )
              )}

            </div>

          </div>

          {/* ACTIONS */}

          <div className="admin-actions-row">

            <button
              type="submit"

              className="admin-submit-btn"

              disabled={saving}
            >

              {saving
                ? "Saving..."
                : "Update Product"}

            </button>

            <button
              type="button"

              className="secondary-admin-btn"

              onClick={() =>
                navigate(
                  "/admin-products"
                )
              }
            >
              Back
            </button>

          </div>

        </form>

        {/* MESSAGE */}

        {message && (

          <div className="admin-message">
            {message}
          </div>

        )}

      </div>

    </div>
  );
};

export default EditProduct;