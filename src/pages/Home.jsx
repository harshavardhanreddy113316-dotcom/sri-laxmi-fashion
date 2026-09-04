import { useState, useEffect } from "react";
import ProductCard from "../components/ProductCard";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import Hero from "../components/Hero";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/Home.css";

function Home({ openCart, search = "", setSearch }) {
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
      product.category.trim().toLowerCase() === category &&
      product.name.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <>
      <Navbar openCart={openCart} search={search} setSearch={setSearch} />

      <Hero />

      {/* Shop by Category */}
      <section className="home-cats" id="shop">
        <div className="home-heading">
          <h2>Shop by Category</h2>
          <div className="home-gold-line" />
        </div>
        <div className="home-cats-row">
          <button
            onClick={() => setCategory("jewellery")}
            className={`home-cat-btn${category === "jewellery" ? " home-cat-active-gold" : ""}`}
          >
            <span className="home-cat-icon">&#x1F451;</span>
            Jewellery
          </button>
          <button
            onClick={() => setCategory("fashion")}
            className={`home-cat-btn${category === "fashion" ? " home-cat-active-blue" : ""}`}
          >
            <span className="home-cat-icon">&#x1F455;</span>
            Fashion
          </button>
        </div>
      </section>

      {/* Collection Grid */}
      <section className="home-sec">
        <div className="home-heading">
          <h2>
            {category === "jewellery"
              ? "Jewellery Collection"
              : "Fashion Collection"}
          </h2>
          <p>
            {category === "jewellery"
              ? "Exquisite pieces to complement your style"
              : "Curated fashion for the modern you"}
          </p>
          <div className="home-gold-line" />
        </div>
        <div className="home-grid">
          {displayProducts.length > 0 ? (
            displayProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <div className="home-empty">
              <h3>No products found</h3>
              <p>Try a different search keyword or browse another category.</p>
            </div>
          )}
        </div>
      </section>

      {/* Why Shop With Us */}
      <section className="home-benefits">
        <div className="home-benefits-inner">
          <div className="home-heading">
            <h2>Why Shop With Us</h2>
            <div className="home-gold-line" />
          </div>
          <div className="home-benefits-grid">
            <div className="home-benefit">
              <div className="home-benefit-icon">&#x2728;</div>
              <h3>Quality Products</h3>
              <p>Handpicked and carefully curated collections.</p>
            </div>
            <div className="home-benefit">
              <div className="home-benefit-icon">&#x1F512;</div>
              <h3>Secure Payments</h3>
              <p>Safe and secure checkout you can trust.</p>
            </div>
            <div className="home-benefit">
              <div className="home-benefit-icon">&#x1F69A;</div>
              <h3>Reliable Delivery</h3>
              <p>Fast shipping directly to your doorstep.</p>
            </div>
            <div className="home-benefit">
              <div className="home-benefit-icon">&#x1F4AC;</div>
              <h3>Customer Support</h3>
              <p>We are here to help via WhatsApp and Instagram.</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

export default Home;
