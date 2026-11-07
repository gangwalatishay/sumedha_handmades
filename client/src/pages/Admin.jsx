import { API_BASE } from "../utils/api";
import { useState } from "react";

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
   ADMIN PAGE
========================================= */

const Admin = () => {

  const [form, setForm] =
    useState({

      name: "",

      price: "",

      salePrice: "",

      stock: "",

      image: "",

      media: [],

      description: "",

      featured: false,

      bestseller: false,

      trending: false,

      categories: [],
    });

  const [message, setMessage] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [uploading, setUploading] =
    useState(false);

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
     MEDIA UPLOAD
  ===================================== */

  const handleMediaUpload =
    async (e) => {

      const files =
        e.target.files;

      if (!files.length)
        return;

      try {

        setUploading(true);

        const formData =
          new FormData();

        for (
          let i = 0;
          i < files.length;
          i++
        ) {

          formData.append(
            "media",
            files[i]
          );
        }

        const res =
          await fetch(
            `${API_BASE}/api/upload`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },

              body: formData,
            }
          );

        const data =
          await res.json();

        setForm((prev) => ({

          ...prev,

          media: [
            ...prev.media,
            ...data,
          ],

          image:
            data[0]?.url || "",
        }));

      } catch (err) {

        console.error(err);

        setMessage(
          "❌ Upload failed"
        );

      } finally {

        setUploading(false);
      }
    };

  /* =====================================
     SUBMIT
  ===================================== */

  const handleSubmit =
    async (e) => {

      e.preventDefault();

      setLoading(true);

      setMessage("");

      try {

        const token =
          localStorage.getItem(
            "token"
          );

        const res =
          await fetch(
            `${API_BASE}/api/products`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  "Bearer " + token,
              },

              body: JSON.stringify({

                name:
                  form.name,

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

                image:
                  form.image,

                media:
                  form.media,

                description:
                  form.description,

                featured:
                  form.featured,

                bestseller:
                  form.bestseller,

                trending:
                  form.trending,

                categories:
                  form.categories,
              }),
            }
          );

        const data =
          await res.json();

        if (!res.ok) {

          throw new Error(
            data.message ||
            "Failed to add product"
          );
        }

        setMessage(
          "✅ Product added successfully"
        );

        /* RESET */

        setForm({

          name: "",

          price: "",

          salePrice: "",

          stock: "",

          image: "",

          media: [],

          description: "",

          featured: false,

          bestseller: false,

          trending: false,

          categories: [],
        });

      } catch (err) {

        console.error(err);

        setMessage(
          "❌ " +
          (
            err.message ||
            "Failed to add product"
          )
        );

      } finally {

        setLoading(false);
      }
    };

  return (
    <div className="admin-page">

      <div className="admin-card">

        {/* HEADER */}

        <div className="admin-header">

          <span>
            ✨ Admin Dashboard
          </span>

          <h1>
            Add New Product
          </h1>

          <p>
            Create beautiful handmade
            product listings for your
            luxury gifting store.
          </p>

        </div>

        {/* FORM */}

        <form
          onSubmit={handleSubmit}
          className="admin-form"
        >

          {/* PRODUCT NAME */}

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
              Product Price
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

          {/* IMAGE URL */}

          <input
            type="text"

            name="image"

            placeholder="
              Product Cover Image URL
            "

            value={form.image}

            onChange={handleChange}
          />

          {/* MEDIA UPLOAD */}

          <div className="media-upload-group">

            <label>
              Upload Images / Videos
            </label>

            <input
              type="file"

              multiple

              accept="
                image/*,
                video/*
              "

              onChange={
                handleMediaUpload
              }
            />

            {uploading && (

              <p className="uploading-text">
                Uploading media...
              </p>

            )}

          </div>

          {/* MEDIA PREVIEW */}

          <div className="media-preview-grid">

            {form.media.map(
              (item, index) => (

                <div
                  key={index}
                  className="media-preview-card"
                >

                  {item.type ===
                  "image" ? (

                    <img
                      src={`${API_BASE}${item.url}`}
                      alt=""
                    />

                  ) : (

                    <video controls>

                      <source
                        src={`${API_BASE}${item.url}`}
                      />

                    </video>

                  )}

                </div>

              )
            )}

          </div>

          {/* DESCRIPTION */}

          <textarea
            name="description"

            placeholder="
              Product Description
            "

            value={form.description}

            onChange={handleChange}

            required
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

          {/* GIFT CATEGORIES */}

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

          {/* BUTTON */}

          <button
            type="submit"

            className="admin-submit-btn"

            disabled={
              loading ||
              uploading
            }
          >

            {loading
              ? "Adding Product..."
              : "Add Product"}

          </button>

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

export default Admin;
