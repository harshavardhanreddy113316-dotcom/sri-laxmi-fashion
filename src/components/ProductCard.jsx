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
      onClick={() => {
        navigate(`/product/${product.id}`);
      }}
      style={{ cursor: "pointer" }}
    >
      <div className="product-image">

  {product.discount > 0 && (
    <span className="sale-badge">
      💥 {product.discount}% OFF
    </span>
  )}

  {product.stock <= 0 && (
    <span className="stock-badge">
      Out of Stock
    </span>
  )}

  <img
    src={product.image}
    alt={product.name}
  />

</div>

      <h3>{product.name}</h3>

     <div className="price-section">

  <span className="new-price">
    ₹{product.price}
  </span>

  {product.originalPrice > product.price && (
    <span className="old-price">
      ₹{product.originalPrice}
    </span>
  )}

</div>

<p
  className={
    product.stock <= 0
      ? "stock-red"
      : product.stock <= 5
      ? "stock-orange"
      : "stock-green"
  }
>
  {product.stock <= 0
    ? "🔴 Out of Stock"
    : product.stock <= 5
    ? `🟡 Only ${product.stock} Left!`
    : "🟢 In Stock"}
</p>

      <button
  onClick={(e) => {
    e.stopPropagation();
    addToCart(product);
  }}
  disabled={product.stock <= 0}
  style={{
    opacity: product.stock <= 0 ? 0.5 : 1,
    cursor: product.stock <= 0 ? "not-allowed" : "pointer",
  }}
>
  {product.stock <= 0
    ? "Out of Stock"
    : "Add to Cart"}
</button>
    </div>
  );
}

export default ProductCard;