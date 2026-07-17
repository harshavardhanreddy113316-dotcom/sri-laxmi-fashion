import { useContext, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Navbar.css";
import logo from "../images/logo.jpeg";
import { CartContext } from "../context/CartContext";

function Navbar({
  openCart,
  search,
  setSearch,
}) {
  const { cartItems } = useContext(CartContext);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);

  const closeSidebar = () => setSidebarOpen(false);
  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target)
      ) {
        closeSidebar();
      }
    };

    if (sidebarOpen) {
      document.addEventListener(
        "mousedown",
        handleOutsideClick
      );
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  return (
    <>
      <header className="navbar">
        {/* Left Section */}
        <div className="navbar-left">
          <button
            className="menu-btn"
            onClick={toggleSidebar}
            aria-label="Open Menu"
          >
            ☰
          </button>

          <div className="logo-section">
            <img
              src={logo}
              alt="Sri Laxmi Fashion"
              className="logo"
            />

            <h2>Sri Laxmi Fashion</h2>
          </div>
        </div>

        {/* Search */}
        <div className="search-section">
          <input
            type="text"
            placeholder="Search products..."
            className="search-bar"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />
        </div>

        {/* Desktop Navigation */}
        <nav className="nav-links">
          <Link to="/">🏠 Home</Link>

          <Link to="/track-order">
            📦 Track Order
          </Link>

          <Link to="/contact">
            📞 Contact
          </Link>

          <Link
            to="/cart"
            className="cart-button"
            onClick={openCart}
            style={{
              textDecoration: "none",
            }}
          >
            🛒 Cart ({cartItems.length})
          </Link>
        </nav>
      </header>

      {/* Overlay */}
      <div
        className={`sidebar-overlay ${
          sidebarOpen ? "show" : ""
        }`}
      />

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`mobile-sidebar ${
          sidebarOpen ? "open" : ""
        }`}
      >
        <div className="sidebar-header">
          <img
            src={logo}
            alt="Sri Laxmi Fashion"
            className="sidebar-logo"
          />

          <button
            className="close-btn"
            onClick={closeSidebar}
            aria-label="Close Menu"
          >
            ✕
          </button>
        </div>

        <h3 className="sidebar-title">
          Sri Laxmi Fashion
        </h3>

        <nav className="sidebar-links">
          <Link
            to="/"
            onClick={closeSidebar}
          >
            🏠 Home
          </Link>

          <Link
            to="/track-order"
            onClick={closeSidebar}
          >
            📦 Track Order
          </Link>

          <Link
            to="/contact"
            onClick={closeSidebar}
          >
            📞 Contact
          </Link>

          <Link
            to="/cart"
            onClick={() => {
              if (openCart) openCart();
              closeSidebar();
            }}
          >
            🛒 Cart ({cartItems.length})
          </Link>
        </nav>
      </aside>
    </>
  );
}

export default Navbar;