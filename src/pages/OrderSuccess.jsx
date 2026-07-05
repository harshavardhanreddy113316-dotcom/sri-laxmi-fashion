import { Link } from "react-router-dom";

function OrderSuccess() {
  const orderId =
    localStorage.getItem("lastOrderId");

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg,#050816,#111827)",
        color: "white",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          textAlign: "center",
          background: "#1f2937",
          padding: "50px",
          borderRadius: "25px",
          maxWidth: "600px",
          width: "100%",
          boxShadow:
            "0 0 25px rgba(0,0,0,0.4)",
        }}
      >
        <h1
          style={{
            color: "#22c55e",
            fontSize: "60px",
            marginBottom: "20px",
          }}
        >
          🎉
        </h1>

        <h1
          style={{
            color: "#d4af37",
            marginBottom: "20px",
            fontSize: "40px",
            lineHeight: "1.2",
          }}
        >
          Order Placed 
          <br />
           Successfully!
        </h1>

        <p
          style={{
            fontSize: "20px",
            color: "#d1d5db",
          }}
        >
          Thank you for shopping with
        </p>

        <h2
          style={{
            marginBottom: "30px",
          }}
        >
          Sri Laxmi Fashion
        </h2>

        <div
          style={{
            background: "#111827",
            padding: "20px",
            borderRadius: "15px",
            marginBottom: "30px",
          }}
        >
          <h3>Your Order ID</h3>

          <h2
            style={{
              color: "#fbbf24",
            }}
          >
            {orderId}
          </h2>
        </div>

        <p
          style={{
            color: "#9ca3af",
            marginBottom: "30px",
          }}
        >
          You can use this Order ID to
          track your order.
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "20px",
            flexWrap: "wrap",
          }}
        >
          <Link
            to="/"
            style={{
              background: "#d4af37",
              color: "black",
              padding: "15px 30px",
              borderRadius: "30px",
              textDecoration: "none",
              fontWeight: "bold",
            }}
          >
            🏠 Continue Shopping
          </Link>

          <Link
            to="/track-order"
            style={{
              background: "#2563eb",
              color: "white",
              padding: "15px 30px",
              borderRadius: "30px",
              textDecoration: "none",
              fontWeight: "bold",
            }}
          >
            📦 Track Order
          </Link>
        </div>
      </div>
    </div>
  );
}

export default OrderSuccess;