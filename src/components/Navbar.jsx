import { Link } from "react-router-dom";
import "../styles/Navbar.css";
import logo from "../images/logo.jpeg";
import { useContext } from "react";
import { CartContext } from "../context/CartContext";

function Navbar({
  openCart,
  search,
  setSearch,
}) {
    console.log(search);
    console.log(setSearch);
  const { cartItems } = useContext(CartContext);

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