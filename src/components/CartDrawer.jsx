import "../styles/CartDrawer.css";
import { useContext } from "react";
import { CartContext } from "../context/CartContext";

function CartDrawer({ isOpen, onClose }) {
  const { cartItems } = useContext(CartContext);

  return (
    <div className={`cart-overlay ${isOpen ? "show" : ""}`}>
      <div className="cart-drawer">
        <div className="cart-header">
          <h2>🛒 Your Cart</h2>
          <button onClick={onClose}>✖</button>
        </div>

        {cartItems.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          cartItems.map((item) => (
            <div key={item.id} className="cart-item">
              <img src={item.image} alt={item.name} />
              <div>
                <h4>{item.name}</h4>
                <p>₹{item.price}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default CartDrawer;