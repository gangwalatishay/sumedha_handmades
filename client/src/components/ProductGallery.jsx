import { API_BASE } from "../utils/api";
import "./ProductGallery.css";

const ProductGallery = ({ products }) => {
  return (
    <div className="gallery-grid">
      {products.map((product) => (
        <div className="gallery-item" key={product._id}>
          <img
            src={`${API_BASE}${product.image}`}
            alt={product.name}
          />
          <div className="gallery-overlay">
            <h4>{product.name}</h4>
            <p>₹{product.price}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductGallery;
