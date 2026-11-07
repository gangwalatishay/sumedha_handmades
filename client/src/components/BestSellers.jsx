import { API_BASE } from "../utils/api";
import {
  useEffect,
  useState,
} from "react";

import ProductCard
from "./ProductCard";

import "../styles/home.css";

const BestSellers = () => {

  const [
    products,
    setProducts,
  ] = useState([]);

  /* =====================================
     FETCH BESTSELLERS
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
              product.bestseller
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
          🔥 Most Loved
        </span>

        <h2>
          Best Sellers
        </h2>

        <p>
          Discover the handmade creations
          our customers absolutely adore.
          Curated with emotion, warmth and
          timeless gifting elegance.
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

export default BestSellers;