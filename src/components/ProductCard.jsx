import { CartContext } from "../context/CartContext";
import "../styles/ProductCard.css";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";

function ProductCard({ product }) {
  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();

  if (!product) {
    return null;
  }

  const cardImage =
    (Array.isArray(product.images) && product.images.length > 0
      ? product.images[0]
      : product.image) || "";

  return (
    <div
      className="pc"
      onClick={() => navigate(`/product/${product.id}`)}
    >
      <div className="pc-img-wrap">
        {product.discount > 0 && (
          <span className="pc-badge pc-badge-sale">
            -{product.discount}%
          </span>
        )}

        {product.stock <= 0 && (
          <span className="pc-badge pc-badge-oos">
            Out of Stock
          </span>
        )}

        <img
          src={cardImage}
          alt={product.name || "Product"}
          className="pc-img"
          loading="lazy"
        />
      </div>

      <div className="pc-body">
        <h3 className="pc-name">{product.name}</h3>

        <div className="pc-price-row">
          <span className="pc-price">₹{product.price}</span>
          {product.originalPrice > product.price && (
            <span className="pc-price-old">₹{product.originalPrice}</span>
          )}
        </div>

        {product.rating != null && product.rating !== undefined && (
          <div className="pc-rating">
            <span className="pc-stars">
              {"★".repeat(Math.round(product.rating))}
              {"☆".repeat(5 - Math.round(product.rating))}
            </span>
            <span className="pc-rating-val">{product.rating}</span>
          </div>
        )}

        {product.stock > 0 && product.stock <= 5 && (
          <p className="pc-stock-low">Only {product.stock} left</p>
        )}

        <button
          className="pc-cart-btn"
          onClick={(e) => {
            e.stopPropagation();
            addToCart(product);
          }}
          disabled={product.stock <= 0}
        >
          {product.stock <= 0 ? "Out of Stock" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}

export default ProductCard;
