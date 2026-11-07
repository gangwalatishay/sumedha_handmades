import { API_BASE } from "../utils/api";
import {
  useEffect,
  useState,
} from "react";

import ProductCard
from "./ProductCard";

import "../styles/home.css";

const TrendingProducts = () => {

  const [
    products,
    setProducts,
  ] = useState([]);

  /* =====================================
     FETCH TRENDING
  ===================================== */

  useEffect(() => {

    fetch(
      `${API_BASE}/api/products`
    )

      .then((res) =>
        res.json()
      )

      .then((data) => {

        const filtered =
          data.filter(
            (product) =>
              product.trending
          );

        setProducts(filtered);
      })

      .catch((err) =>
        console.error(err)
      );

  }, []);

  if (
    products.length === 0
  ) {
    return null;
  }

  return (
    <section className="lux-section">

      <div className="section-heading">

        <span>
          ✨ Trending Now
        </span>

        <h2>
          Trending Handmade Gifts
        </h2>

        <p>
          Explore beautifully trending
          handcrafted creations designed
          for meaningful gifting moments.
        </p>

      </div>

      <div className="horizontal-products">

        {products.map(
          (product) => (

            <ProductCard
              key={product._id}
              product={product}
            />

          )
        )}

      </div>

    </section>
  );
};

export default TrendingProducts;