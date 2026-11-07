import { API_BASE } from "../utils/api";
import {
  useEffect,
  useState,
} from "react";

import ProductCard from "./ProductCard";

import "../styles/home.css";

const FeaturedProducts = () => {

  const [products, setProducts] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    fetch(
      `${API_BASE}/api/products/featured`
    )

      .then((res) => {

        if (!res.ok) {

          throw new Error(
            "Failed to fetch featured products"
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

        setLoading(false);
      });

  }, []);

  if (loading) {
    return null;
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="featured-products">

      <div className="section-heading">

        <span>
          Best Sellers
        </span>

        <h2>
          Featured Handmade Pieces
        </h2>

        <p>
          Explore our most loved handcrafted
          creations thoughtfully curated for
          gifting, celebrations and beautiful
          memories.
        </p>

      </div>

      <div className="featured-grid">

        {products.map((product) => (

          <ProductCard
            key={product._id}
            product={product}
          />

        ))}

      </div>

    </section>
  );
};

export default FeaturedProducts;