import { useState, useEffect } from "react";
import ProductCard from "../components/ProductCard";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import Hero from "../components/Hero";
import Navbar from "../components/Navbar";

function Home({
  openCart,
  search = "",
  setSearch,
}) {
  const [category, setCategory] = useState("jewellery");
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const snapshot = await getDocs(collection(db, "products"));

        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        console.log("Products from Firestore:", data);

        setProducts(data);
      } catch (error) {
        console.error("Error loading products:", error);
      }
    };

    loadProducts();
  }, []);

  const displayProducts = products.filter((product) => {
    if (!product) return false;
    if (!product.category) return false;
    if (!product.name) return false;

    return (
      product.category.trim().toLowerCase() ===
        category &&
      product.name
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  });

  return (
    <>
      <Navbar
        openCart={openCart}
        search={search}
        setSearch={setSearch}
      />

      <Hero />

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "20px",
          margin: "30px 0",
        }}
      >
        <button
          onClick={() => setCategory("jewellery")}
          style={{
            padding: "15px 30px",
            borderRadius: "30px",
            border: "none",
            cursor: "pointer",
            fontSize: "16px",
            background:
              category === "jewellery"
                ? "#d4af37"
                : "#333",
            color: "white",
            fontWeight: "bold",
          }}
        >
          👑 Jewellery
        </button>

        <button
          onClick={() => setCategory("fashion")}
          style={{
            padding: "15px 30px",
            borderRadius: "30px",
            border: "none",
            cursor: "pointer",
            fontSize: "16px",
            background:
              category === "fashion"
                ? "#2196f3"
                : "#333",
            color: "white",
            fontWeight: "bold",
          }}
        >
          👕 Fashion
        </button>
      </div>

      <section className="products-section">
        <h2 className="products-title">
          {category === "jewellery"
            ? "👑 Jewellery Collection"
            : "👕 Fashion Collection"}
        </h2>

        <div className="products-grid">
          {displayProducts.length > 0 ? (
            displayProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))
          ) : (
            <h2
              style={{
                color: "white",
                textAlign: "center",
                width: "100%",
              }}
            >
              No Products Found
            </h2>
          )}
        </div>
      </section>
    </>
  );
}

export default Home;