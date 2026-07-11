import { Link } from "react-router-dom";
import "../styles/Navbar.css";
import logo from "../images/logo.jpeg";
import { useContext, useState } from "react";
import { CartContext } from "../context/CartContext";

function Navbar({
  search,
  setSearch,
}) {
  const { cartItems } = useContext(CartContext);

  const [menuOpen, setMenuOpen] =
    useState(false);

  return (
    <header className="navbar">

      <div className="logo-section">

        <img
          src={logo}
          alt="Sri Laxmi Fashion"
          className="logo"
        />

        <h2>Sri Laxmi Fashion</h2>

      </div>

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

      <button
        className="menu-btn"
        onClick={() =>
          setMenuOpen(!menuOpen)
        }
      >
        ☰
      </button>

      <nav
        className={`nav-links ${
          menuOpen ? "active" : ""
        }`}
      >

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
          style={{
            textDecoration: "none",
          }}
        >
          🛒 Cart ({cartItems.length})
        </Link>

      </nav>

    </header>
  );
}

export default Navbar;