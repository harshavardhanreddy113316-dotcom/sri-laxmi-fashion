import { useState } from "react";

function TrackOrder() {
  const [orderId, setOrderId] = useState("");
  const [phone, setPhone] = useState("");
  const [order, setOrder] = useState(null);

  const trackOrder = () => {
    const orders =
      JSON.parse(localStorage.getItem("orders")) || [];

    const foundOrder = orders.find(
      (item) =>
        item.orderId === orderId &&
        item.phone === phone
    );

    if (foundOrder) {
      setOrder(foundOrder);
    } else {
      alert("Order not found.");
      setOrder(null);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#111827",
        color: "white",
        padding: "40px",
      }}
    >
      <div
        style={{
          maxWidth: "700px",
          margin: "auto",
          background: "#1f2937",
          padding: "40px",
          borderRadius: "20px",
          boxShadow: "0 0 20px rgba(0,0,0,0.4)",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            marginBottom: "30px",
          }}
        >
          📦 Track Your Order
        </h1>

        <input
          type="text"
          placeholder="Order ID"
          value={orderId}
          onChange={(e) =>
            setOrderId(e.target.value)
          }
          style={{
            width: "100%",
            padding: "15px",
            marginBottom: "20px",
            borderRadius: "10px",
            border: "none",
          }}
        />

        <input
          type="text"
          placeholder="Phone Number"
          value={phone}
          onChange={(e) =>
            setPhone(e.target.value)
          }
          style={{
            width: "100%",
            padding: "15px",
            marginBottom: "20px",
            borderRadius: "10px",
            border: "none",
          }}
        />

        <button
          onClick={trackOrder}
          style={{
            width: "100%",
            padding: "15px",
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "10px",
            fontSize: "18px",
            cursor: "pointer",
          }}
        >
          Track Order
        </button>

        {order && (
          <div
            style={{
              marginTop: "40px",
              background: "#374151",
              padding: "25px",
              borderRadius: "15px",
            }}
          >
            <h2>
              Order ID: {order.orderId}
            </h2>

            <h2
              style={{
                color:
                  order.status === "Delivered"
                    ? "#22c55e"
                    : order.status === "Shipped"
                    ? "#3b82f6"
                    : order.status === "Packed"
                    ? "#f59e0b"
                    : "#ef4444",
              }}
            >
              {order.status}
            </h2>

            <hr />

            <p>
              <strong>Name:</strong>{" "}
              {order.customerName}
            </p>

            <p>
              <strong>Phone:</strong>{" "}
              {order.phone}
            </p>

            <hr />

            <h3>🏠 Delivery Address</h3>

            <p>{order.house}</p>

            <p>{order.street}</p>

            <p>
              {order.city}, {order.district}
            </p>

            <p>
              {order.stateName} - {order.pincode}
            </p>

            {order.landmark && (
              <p>
                Landmark: {order.landmark}
              </p>
            )}

            <hr />

            <h3>💳 Payment</h3>

            <p>
              {order.paymentMethod}
            </p>

            <hr />

            <h3>🛍 Products</h3>

            {order.items.map((item, index) => (
              <p key={index}>
                • {item.name} ×{" "}
                {item.quantity || 1}
              </p>
            ))}

            <hr />

            <h3>🚚 Tracking Number</h3>

            <p
              style={{
                color: "#60a5fa",
              }}
            >
              {order.trackingId ||
                "Not Available Yet"}
            </p>

            <hr />

            <h2
              style={{
                color: "#22c55e",
              }}
            >
              Total: ₹{order.total}
            </h2>

            <p>
              Ordered On: {order.date}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default TrackOrder;