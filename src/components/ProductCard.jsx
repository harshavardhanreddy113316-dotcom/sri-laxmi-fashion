import { CartContext } from "../context/CartContext";
import "../styles/ProductCard.css";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";

function ProductCard({ product }) {
  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();

  console.log("PRODUCT RECEIVED:", product);

  if (!product) {
    return <h2>Product is Undefined</h2>;
  }

  return (
    <div
      className="product-card"
      onClick={() =>
        navigate(`/product/${encodeURIComponent(product.name)}`)
      }
      style={{ cursor: "pointer" }}
    >
      <img src={product.image} alt={product.name} />

      <h3>{product.name}</h3>

      <p>₹{product.price}</p>

      <button
        onClick={(e) => {
          e.stopPropagation();
          addToCart(product);
        }}
      >
        Add to Cart
      </button>
    </div>
  );
}

export default ProductCard;