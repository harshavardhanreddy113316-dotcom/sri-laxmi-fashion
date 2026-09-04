import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { CartContext } from "../context/CartContext";
import ProductCard from "../components/ProductCard";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/ProductDetails.css";

function ProductDetails({ search = "", setSearch }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      setQuantity(1);
      setSelectedImage(null);
      try {
        const snapshot = await getDoc(doc(db, "products", id));

        if (snapshot.exists()) {
          const productData = {
            id: snapshot.id,
            ...snapshot.data(),
          };
          setProduct(productData);

          // Load similar products from same category
          const allSnapshot = await getDocs(collection(db, "products"));
          const similar = allSnapshot.docs
            .map((d) => ({ id: d.id, ...d.data() }))
            .filter(
              (p) =>
                p.id !== productData.id &&
                p.category &&
                productData.category &&
                p.category.trim().toLowerCase() ===
                  productData.category.trim().toLowerCase()
            )
            .slice(0, 6);

          setSimilarProducts(similar);
        } else {
          setProduct(null);
        }

        setLoading(false);
      } catch (error) {
        console.log(error);
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  // Scroll to top when navigating to a new product
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return (
      <>
        <Navbar search={search} setSearch={setSearch} />
        <div className="pd-loading">
          <div className="pd-spinner" />
          <p>Loading product...</p>
        </div>
        <Footer />
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Navbar search={search} setSearch={setSearch} />
        <div className="pd-loading">
          <h1>Product Not Found</h1>
          <button className="pd-back" onClick={() => navigate("/")}>
            &larr; Back to Home
          </button>
        </div>
        <Footer />
      </>
    );
  }

  // Build image list: prefer images[] array, fall back to single image
  const imageList =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : product.image
      ? [product.image]
      : [];

  const activeImage = selectedImage ?? imageList[0];

  const inStock = product.stock > 0;
  const categoryLabel =
    product.category && product.category.trim().toLowerCase() === "fashion"
      ? "Fashion"
      : "Jewellery";

  const handleAddToCart = () => {
    if (!inStock) return;
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
  };

  const handleBuyNow = () => {
    if (!inStock) return;
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    navigate("/checkout");
  };

  // Build a specifications list from real fields only
  const specs = [];
  if (product.category) {
    specs.push({ label: "Category", value: categoryLabel });
  }
  if (product.price != null) {
    specs.push({ label: "Price", value: `₹${product.price}` });
  }
  if (product.originalPrice != null && product.originalPrice > product.price) {
    specs.push({ label: "Original Price", value: `₹${product.originalPrice}` });
  }
  if (product.discount != null && product.discount > 0) {
    specs.push({ label: "Discount", value: `${product.discount}% OFF` });
  }
  if (product.stock != null) {
    specs.push({
      label: "Availability",
      value: inStock ? `In Stock (${product.stock})` : "Out of Stock",
    });
  }

  return (
    <>
      <Navbar search={search} setSearch={setSearch} />

      <div className="pd-page">
        <div className="pd-inner">
          {/* Breadcrumb */}
          <nav className="pd-breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span className="pd-breadcrumb-sep">›</span>
            <Link to="/#shop">{categoryLabel}</Link>
            <span className="pd-breadcrumb-sep">›</span>
            <span className="pd-breadcrumb-current">{product.name}</span>
          </nav>

          {/* Main product area */}
          <div className="pd-main">
            {/* LEFT: Image gallery */}
            <div className="pd-gallery">
              <div className="pd-gallery-main">
                {activeImage ? (
                  <img
                    src={activeImage}
                    alt={product.name}
                    className="pd-gallery-img"
                  />
                ) : (
                  <div className="pd-img-placeholder">No Image</div>
                )}
                {product.discount > 0 && (
                  <span className="pd-discount-badge">
                    {product.discount}% OFF
                  </span>
                )}
              </div>

              {imageList.length > 1 && (
                <div className="pd-thumbs">
                  {imageList.map((img, i) => (
                    <button
                      key={i}
                      className={`pd-thumb${
                        img === activeImage ? " active" : ""
                      }`}
                      onClick={() => setSelectedImage(img)}
                      aria-label={`View image ${i + 1}`}
                    >
                      <img src={img} alt={`${product.name} ${i + 1}`} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT: Product info + purchase */}
            <div className="pd-info">
              <h1 className="pd-title">{product.name}</h1>

              {product.rating != null && product.rating !== undefined && (
                <div className="pd-rating">
                  <span className="pd-stars">
                    {"★".repeat(Math.round(product.rating))}
                    {"☆".repeat(5 - Math.round(product.rating))}
                  </span>
                  <span className="pd-rating-text">{product.rating}</span>
                </div>
              )}

              <div className="pd-prices">
                <span className="pd-price">₹{product.price}</span>
                {product.originalPrice > product.price && (
                  <span className="pd-price-old">₹{product.originalPrice}</span>
                )}
                {product.discount > 0 && (
                  <span className="pd-discount-tag">
                    {product.discount}% OFF
                  </span>
                )}
              </div>

              <p
                className={`pd-stock${inStock ? "" : " pd-stock-out"}`}
              >
                {inStock ? "In Stock" : "Out of Stock"}
              </p>

              {/* Purchase panel */}
              <div className="pd-purchase">
                <div className="pd-qty-row">
                  <span className="pd-qty-label">Quantity</span>
                  <div className="pd-qty">
                    <button
                      className="pd-qty-btn"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={!inStock}
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="pd-qty-val">{quantity}</span>
                    <button
                      className="pd-qty-btn"
                      onClick={() =>
                        setQuantity((q) =>
                          inStock ? Math.min(product.stock, q + 1) : q
                        )
                      }
                      disabled={!inStock}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="pd-actions">
                  <button
                    className="pd-btn pd-btn-cart"
                    disabled={!inStock}
                    onClick={handleAddToCart}
                  >
                    {inStock ? "Add to Cart" : "Out of Stock"}
                  </button>
                  <button
                    className="pd-btn pd-btn-buy"
                    disabled={!inStock}
                    onClick={handleBuyNow}
                  >
                    {inStock ? "Buy Now" : "Unavailable"}
                  </button>
                </div>
              </div>

              {/* Delivery / trust info */}
              <div className="pd-trust">
                <div className="pd-trust-item">
                  <span className="pd-trust-icon">🚚</span>
                  <div>
                    <strong>Delivery Available</strong>
                    <p>We deliver to your doorstep</p>
                  </div>
                </div>
                <div className="pd-trust-item">
                  <span className="pd-trust-icon">🔒</span>
                  <div>
                    <strong>Secure Payment</strong>
                    <p>Safe and trusted checkout</p>
                  </div>
                </div>
                <div className="pd-trust-item">
                  <span className="pd-trust-icon">💬</span>
                  <div>
                    <strong>Easy Support</strong>
                    <p>Reach us via WhatsApp / Instagram</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Below: Description + Specifications */}
          <div className="pd-details">
            {product.description && (
              <div className="pd-desc">
                <h2>Product Description</h2>
                <p>{product.description}</p>
              </div>
            )}

            {specs.length > 0 && (
              <div className="pd-specs">
                <h2>Product Details</h2>
                <div className="pd-specs-table">
                  {specs.map((spec, i) => (
                    <div className="pd-spec-row" key={i}>
                      <span className="pd-spec-label">{spec.label}</span>
                      <span className="pd-spec-value">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <section className="pd-similar">
            <div className="pd-similar-inner">
              <div className="pd-similar-header">
                <h2>You May Also Like</h2>
                <div className="home-gold-line" />
              </div>
              <div className="pd-similar-scroll">
                {similarProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          </section>
        )}

      </div>

      <Footer />
    </>
  );
}

export default ProductDetails;
