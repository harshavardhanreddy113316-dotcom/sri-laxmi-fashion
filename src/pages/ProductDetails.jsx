import { useParams } from "react-router-dom";
import products from "../data/products";
import fashion from "../data/fashion";

function ProductDetails() {
  const { id } = useParams();

  const allProducts = [...products, ...fashion];

  const product = allProducts.find(
    (item) =>
      item.name === decodeURIComponent(id)
  );

  if (!product) {
    return (
      <h1
        style={{
          color: "white",
          textAlign: "center",
          marginTop: "50px",
        }}
      >
        Product Not Found
      </h1>
    );
  }

  return (
    <div
      style={{
        background: "#f5f5f5",
        minHeight: "100vh",
        padding: "40px",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "auto",
          display: "flex",
          gap: "50px",
          background: "white",
          padding: "30px",
          borderRadius: "20px",
          boxShadow: "0 0 15px rgba(0,0,0,0.1)",
        }}
      >
        {/* Left Side */}
        <div style={{ flex: 1 }}>
          <img
            src={product.image}
            alt={product.name}
            style={{
              width: "100%",
              borderRadius: "15px",
            }}
          />
        </div>

        {/* Right Side */}
        <div style={{ flex: 1 }}>
          <h1>{product.name}</h1>

          <h2
            style={{
              color: "#2563eb",
            }}
          >
            ₹{product.price}
          </h2>

          <p
            style={{
              marginTop: "20px",
              color: "#555",
              lineHeight: "1.8",
            }}
          >
            Premium quality product from Sri Laxmi Fashion.
          </p>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;