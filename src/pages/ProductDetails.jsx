import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { CartContext } from "../context/CartContext";
import "../styles/ProductDetails.css";

function ProductDetails() {
  const { id } = useParams();

  const navigate = useNavigate();

  const { addToCart } = useContext(CartContext);

  const [product, setProduct] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const snapshot = await getDoc(
          doc(db, "products", id)
        );

        if (snapshot.exists()) {
          setProduct({
            id: snapshot.id,
            ...snapshot.data(),
          });
        }

        setLoading(false);
      } catch (error) {
        console.log(error);

        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  if (loading) {
    return (
      <h1 className="loading">
        Loading...
      </h1>
    );
  }

  if (!product) {
    return (
      <h1 className="loading">
        Product Not Found
      </h1>
    );
  }

  return (
    <div className="product-page">

      <div className="product-container">

        <div className="product-image">

          <img
            src={product.image}
            alt={product.name}
          />

        </div>

        <div className="product-info">

          <h1>{product.name}</h1>

          <div className="price-box">

            <span className="price">
              ₹{product.price}
            </span>

            {product.originalPrice && (
              <span className="old-price">
                ₹{product.originalPrice}
              </span>
            )}

            {product.discount > 0 && (
              <span className="discount">
                {product.discount}% OFF
              </span>
            )}

          </div>

          <p className="stock">

            {product.stock > 0
              ? "✔ In Stock"
              : "❌ Out of Stock"}

          </p>

          <h3>Description</h3>

          <p className="description">
            {product.description}
          </p>

          <div className="buttons">

            <button
  className="cart-btn"
  disabled={product.stock <= 0}
  onClick={() => {
    if (product.stock <= 0) return;
    addToCart(product);
  }}
>
  {product.stock <= 0
    ? "Out of Stock"
    : "Add To Cart"}
</button>

            <button
  className="buy-btn"
  disabled={product.stock <= 0}
  onClick={() => {
    if (product.stock <= 0) return;

    addToCart(product);
    navigate("/checkout");
  }}
>
  {product.stock <= 0
    ? "Out of Stock"
    : "Buy Now"}
</button>

          </div>

        </div>

      </div>

    </div>
  );
}

export default ProductDetails;