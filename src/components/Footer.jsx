import { Link } from "react-router-dom";
import "../styles/Footer.css";

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-brand">
          <h3 className="footer-logo">Sri Laxmi Fashion</h3>
          <p className="footer-tagline">
            Premium fashion and jewellery curated for every occasion.
          </p>
        </div>

        <div className="footer-links-group">
          <div className="footer-col">
            <h4>Quick Links</h4>
            <Link to="/">Home</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/track-order">Track Order</Link>
            <Link to="/cart">Cart</Link>
          </div>

          <div className="footer-col">
            <h4>Categories</h4>
            <a href="#shop">Jewellery</a>
            <a href="#shop">Fashion</a>
          </div>

          <div className="footer-col">
            <h4>Contact Us</h4>
            <p>WhatsApp / Instagram</p>
            <p>Sri Laxmi Fashion</p>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Sri Laxmi Fashion. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
