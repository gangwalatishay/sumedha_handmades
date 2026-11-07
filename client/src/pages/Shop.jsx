import { API_BASE } from "../utils/api";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import "../styles/shop.css";

import ProductCard from "../components/ProductCard";

/* =========================================
   FILTER OPTIONS
========================================= */

const FILTERS = [

  {
    label: "All",
    value: "all",
    emoji: "✨",
  },

  {
    label: "Birthday",
    value: "birthday",
    emoji: "🎂",
  },

  {
    label: "Anniversary",
    value: "anniversary",
    emoji: "💍",
  },

  {
    label: "Wedding",
    value: "wedding",
    emoji: "💒",
  },

  {
    label: "Long Distance",
    value: "long-distance",
    emoji: "🌍",
  },

  {
    label: "Love",
    value: "love",
    emoji: "❤️",
  },

  {
    label: "Surprise",
    value: "surprise",
    emoji: "🎁",
  },

  {
    label: "Apology",
    value: "apology",
    emoji: "🥺",
  },

  {
    label: "Proposal",
    value: "proposal",
    emoji: "💌",
  },

  {
    label: "Friendship",
    value: "friendship",
    emoji: "🫶",
  },

  {
    label: "Baby",
    value: "baby",
    emoji: "👶",
  },
];

/* =========================================
   SHOP PAGE
========================================= */

const Shop = () => {

  const navigate =
    useNavigate();

  const [searchParams] =
    useSearchParams();

  const selectedCategory =
    searchParams.get("category")
    || "all";

  const [products, setProducts] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [sortBy, setSortBy] =
    useState("latest");

  /* =====================================
     FETCH PRODUCTS
  ===================================== */

  useEffect(() => {

    fetch(
      `${API_BASE}/api/products`
    )

      .then((res) => {

        if (!res.ok) {

          throw new Error(
            "Failed to fetch products"
          );
        }

        return res.json();
      })

      .then((data) => {

        setProducts(data);

        setLoading(false);
      })

      .catch((err) => {

        console.error(err);

        setError(true);

        setLoading(false);
      });

  }, []);

  /* =====================================
     FILTER + SEARCH + SORT
  ===================================== */

  const filteredProducts =
    useMemo(() => {

      let filtered =
        [...products];

      /* CATEGORY FILTER */

      if (
        selectedCategory !== "all"
      ) {

        filtered =
          filtered.filter(
            (product) =>
              product.categories?.includes(
                selectedCategory
              )
          );
      }

      /* SEARCH */

      if (search.trim()) {

        filtered =
          filtered.filter(
            (product) => {

              const text = `
                ${product.name}
                ${product.description || ""}
                ${product.category || ""}
              `
                .toLowerCase();

              return text.includes(
                search.toLowerCase()
              );
            }
          );
      }

      /* SORT */

      switch (sortBy) {

        case "low-high":

          filtered.sort(
            (a, b) =>
              (a.salePrice || a.price)
              -
              (b.salePrice || b.price)
          );

          break;

        case "high-low":

          filtered.sort(
            (a, b) =>
              (b.salePrice || b.price)
              -
              (a.salePrice || a.price)
          );

          break;

        case "featured":

          filtered.sort(
            (a, b) =>
              b.featured -
              a.featured
          );

          break;

        case "rating":

          filtered.sort(
            (a, b) =>
              (b.rating || 0)
              -
              (a.rating || 0)
          );

          break;

        default:

          filtered.sort(
            (a, b) =>
              new Date(
                b.createdAt
              )
              -
              new Date(
                a.createdAt
              )
          );
      }

      return filtered;

    }, [
      products,
      selectedCategory,
      search,
      sortBy,
    ]);

  /* =====================================
     LOADING
  ===================================== */

  if (loading) {

    return (
      <p className="shop-status">
        Loading handmade creations...
      </p>
    );
  }

  /* =====================================
     ERROR
  ===================================== */

  if (error) {

    return (
      <p className="shop-status error">
        Failed to load products
      </p>
    );
  }

  return (
    <div className="shop-page">

      {/* =====================================
         HERO
      ===================================== */}

      <div className="shop-hero">

        <span>
          ✨ Curated Handmade Gifts
        </span>

        <h1>
          Discover Beautiful
          Handmade Creations
        </h1>

        <p>
          Explore thoughtfully curated
          handcrafted gifts designed
          to celebrate emotions,
          memories and meaningful moments.
        </p>

      </div>

      {/* =====================================
         SEARCH + SORT
      ===================================== */}

      <div className="shop-controls">

        {/* SEARCH */}

        <div className="search-box">

          <input
            type="text"

            placeholder="
              Search handmade gifts...
            "

            value={search}

            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
          />

        </div>

        {/* SORT */}

        <div className="sort-box">

          <select
            value={sortBy}

            onChange={(e) =>
              setSortBy(
                e.target.value
              )
            }
          >

            <option value="latest">
              Latest
            </option>

            <option value="low-high">
              Price: Low to High
            </option>

            <option value="high-low">
              Price: High to Low
            </option>

            <option value="featured">
              Featured
            </option>

            <option value="rating">
              Best Rated
            </option>

          </select>

        </div>

      </div>

      {/* =====================================
         CATEGORY FILTERS
      ===================================== */}

      <div className="shop-filters">

        {FILTERS.map((filter) => (

          <button
            key={filter.value}

            className={
              selectedCategory ===
              filter.value

                ? "filter-chip active"

                : "filter-chip"
            }

            onClick={() => {

              if (
                filter.value === "all"
              ) {

                navigate("/shop");

              } else {

                navigate(
                  `/shop?category=${filter.value}`
                );
              }
            }}
          >

            <span>
              {filter.emoji}
            </span>

            {filter.label}

          </button>

        ))}

      </div>

      {/* =====================================
         PRODUCT COUNT
      ===================================== */}

      <div className="shop-results">

        <p>
          Showing
          {" "}
          <strong>
            {filteredProducts.length}
          </strong>
          {" "}
          handcrafted products
        </p>

      </div>

      {/* =====================================
         PRODUCTS
      ===================================== */}

      <div className="shop-products">

        {filteredProducts.length === 0 ? (

          <div className="empty-products">

            <h3>
              No products found
            </h3>

            <p>
              Try searching another
              category or keyword.
            </p>

          </div>

        ) : (

          <div className="product-grid">

            {filteredProducts.map(
              (product) => (

                <ProductCard
                  key={product._id}
                  product={product}
                />

              )
            )}

          </div>

        )}

      </div>

    </div>
  );
};

export default Shop;