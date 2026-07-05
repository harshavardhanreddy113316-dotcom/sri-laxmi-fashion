import { useContext } from "react";
import { CartContext } from "../context/CartContext";

function Cart() {
  const { 
     cartItems,
      removeFromCart,
      increaseQuantity,
      decreaseQuantity
   } = useContext(CartContext);

  const total = cartItems.reduce(
  (sum, item) => sum + item.price * (item.quantity || 1),
  0
);

  return (
    <div style={{ padding: "30px", maxWidth: "1000px", margin: "auto" }}>
      <h1
  style={{
    textAlign: "center",
    marginBottom: "30px",
  }}
>
  🛒 Sri Laxmi Fashion Cart
</h1>

      {cartItems.length === 0 ? (
        <h3>Your cart is empty.</h3>
      ) : (
        <>
          {cartItems.map((item, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                gap: "20px",
                alignItems: "center",
                border: "1px solid #ddd",
                padding: "15px",
                borderRadius: "10px",
                marginBottom: "20px",
              }}
            >
              <img
                src={item.image}
                alt={item.name}
                width="120"
                style={{ borderRadius: "10px" }}
              />

              <div>
                <h3>{item.name}</h3>
                <h2>₹{item.price}</h2>
                <p>Quantity: {item.quantity || 1}</p>
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    alignItems: "center",
                    marginTop: "10px",
                    marginBottom: "10px",
               }}
             >
                 <button onClick={() =>{
                    console.log("MINUS CLICKED");
                    decreaseQuantity(item.name)
                 }}
                 >
                   -
                </button>

                 <span>{item.quantity || 1}</span>

                 <button onClick={() => {
                    console.log("PLUS CLICKED");
                    increaseQuantity(item.name);
                 }}
                 >
                    +
                  </button>
                  </div>
                <button
                  onClick={() => removeFromCart(index)}
                  style={{
                    padding: "8px 12px",
                    background: "red",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    marginTop: "10px",
                  }}
                >
                  🗑 Remove
                </button>
              </div>
            </div>
          ))}

          <hr />

          <h2>Total: ₹{total}</h2>

          <button
            onClick={() => {
              window.location.href = "/checkout";
            }}
            style={{
              padding: "15px 35px",
              background: "black",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Proceed to Checkout
          </button>
        </>
      )}
    </div>
  );
}

export default Cart;