import { useContext, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { CartContext } from "../context/CartContext";

function Checkout() {
  const {
  cartItems,
  clearCart,
} = useContext(CartContext);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [house, setHouse] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [stateName, setStateName] = useState("");
  const [pincode, setPincode] = useState("");
  const [landmark, setLandmark] = useState("");
  const [paymentMethod, setPaymentMethod] =
    useState("");
    const [couponCode, setCouponCode] =
  useState("");

const [discountAmount, setDiscountAmount] =
  useState(0);

const [couponApplied, setCouponApplied] =
  useState(false);

  const [couponMessage, setCouponMessage]=
  useState("")

  const total = cartItems.reduce(
  (sum, item) =>
    sum + item.price * (item.quantity || 1),
  0
);

const applyCoupon = () => {
  const coupons =
    JSON.parse(
      localStorage.getItem("coupons")
    ) || [];

  const foundCoupon = coupons.find(
    (coupon) =>
      coupon.code.toLowerCase() ===
      couponCode.toLowerCase()
  );

    if (foundCoupon) {
  const today = new Date();
  const expiry = new Date(
    foundCoupon.expiry
  );

  if (expiry < today) {
    setCouponApplied(false);
    setDiscountAmount(0);

    setCouponMessage(
      "❌ Coupon Expired"
    );

    return;
  }
    const discount =
      (total * foundCoupon.discount) / 100;

    setDiscountAmount(discount);
    setCouponApplied(true);

    setCouponMessage(
  "✅ Coupon Applied Successfully"
);
  } else {
    setDiscountAmount(0);
    setCouponApplied(false);

    setCouponMessage(
  "❌ Invalid Coupon Code"
);
  }
};
  

  const handleSubmit = async (e) => {
    e.preventDefault();

    const orderId =
      "SLF" + Math.floor(Math.random() * 100000);

    const newOrder = {
      orderId,
      customerName: name,
      phone,
      house,
      street,
      city,
      district,
      stateName,
      pincode,
      landmark,
      paymentMethod,
      items: cartItems,
      total,
      status: "Pending",
      date: new Date().toLocaleDateString(),
      discount: discountAmount,
    };

   await addDoc(
  collection(db, "orders"),
  newOrder
);

    localStorage.setItem(
  "lastOrderId",
  orderId
);

clearCart();

window.location.href =
  "/order-success";
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
          maxWidth: "800px",
          margin: "auto",
          background: "#1f2937",
          padding: "40px",
          borderRadius: "20px",
          boxShadow:
            "0 0 20px rgba(0,0,0,0.3)",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            marginBottom: "30px",
          }}
        >
          💳 Secure Checkout
        </h1>

        <div
          style={{
            background: "#374151",
            padding: "20px",
            borderRadius: "15px",
            marginBottom: "30px",
          }}
        >
          <h2>📦 Order Summary</h2>

          <div
  style={{
    marginTop: "20px",
  }}
>
  <h3>🎟 Have a Coupon?</h3>

  <input
    type="text"
    placeholder="Enter Coupon Code"
    value={couponCode}
    onChange={(e) =>
      setCouponCode(e.target.value)
    }
  />

  <button
    type="button"
    onClick={applyCoupon}
    style={{
      marginTop: "10px",
      padding: "12px",
      background: "#22c55e",
      color: "white",
      border: "none",
      borderRadius: "10px",
      cursor: "pointer",
    }}
  >
    Apply Coupon
  </button>
  <p
  style={{
    color: couponApplied
      ? "#22c55e"
      : "#ef4444",
    marginTop: "10px",
    fontWeight: "bold",
  }}
>
  {couponMessage}
</p>
</div>

          <p>
            Total Items: {cartItems.length}
          </p>

          <h2
  style={{
    color: "#fbbf24",
  }}
>
  Subtotal: ₹{total}
</h2>

{couponApplied && (
  <h3
    style={{
      color: "#22c55e",
    }}
  >
    Discount: ₹
    {discountAmount.toFixed(0)}
  </h3>
)}

<h2
  style={{
    color: "#fbbf24",
  }}
>
  Total: ₹
  {(total - discountAmount).toFixed(0)}
</h2>

        </div>

        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "15px",
          }}
        >
          <h2>👤 Customer Information</h2>

          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
            required
          />

          <input
            type="tel"
            placeholder="Mobile Number"
            value={phone}
            onChange={(e) =>
              setPhone(e.target.value)
            }
            required
          />

          <input
            type="email"
            placeholder="Email (Optional)"
          />

          <h2>🏠 Delivery Address</h2>

          <input
            type="text"
            placeholder="House / Flat No"
            value={house}
            onChange={(e) =>
              setHouse(e.target.value)
            }
            required
          />

          <input
            type="text"
            placeholder="Street / Area"
            value={street}
            onChange={(e) =>
              setStreet(e.target.value)
            }
            required
          />

          <input
            type="text"
            placeholder="Village / Town / City"
            value={city}
            onChange={(e) =>
              setCity(e.target.value)
            }
            required
          />

          <input
            type="text"
            placeholder="District"
            value={district}
            onChange={(e) =>
              setDistrict(e.target.value)
            }
            required
          />

          <input
            type="text"
            placeholder="State"
            value={stateName}
            onChange={(e) =>
              setStateName(e.target.value)
            }
            required
          />

          <input
            type="text"
            placeholder="PIN Code"
            value={pincode}
            onChange={(e) =>
              setPincode(e.target.value)
            }
            required
          />

          <input
            type="text"
            placeholder="Landmark (Optional)"
            value={landmark}
            onChange={(e) =>
              setLandmark(e.target.value)
            }
          />

          <h2>💳 Payment Method</h2>

          <select
            value={paymentMethod}
            onChange={(e) =>
              setPaymentMethod(
                e.target.value
              )
            }
            required
          >
            <option value="">
              Select Payment Method
            </option>

            <option>
              UPI Payment
            </option>

            <option>
              Debit Card
            </option>

            <option>
              Credit Card
            </option>

            <option>
              Net Banking
            </option>
          </select>

          <button
            type="submit"
            style={{
              padding: "18px",
              background: "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "12px",
              cursor: "pointer",
              fontSize: "18px",
              marginTop: "20px",
            }}
          >
            Place Order 🛍️
          </button>
        </form>
      </div>

      <style>
        {`
          input,
          select {
            padding: 15px;
            border-radius: 10px;
            border: none;
            background: #374151;
            color: white;
            font-size: 16px;
          }

          input::placeholder {
            color: #d1d5db;
          }
        `}
      </style>
    </div>
  );
}

export default Checkout;