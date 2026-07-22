import { toast } from "react-toastify";
import { useContext, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
} from "firebase/firestore";
import { CartContext } from "../context/CartContext";
import axios from "axios";

/* ---------- Lightweight inline icons (no external icon library) ---------- */

const IconLock = (props) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="4" y="10" width="16" height="10" rx="2.5" />
    <path d="M7.5 10V7a4.5 4.5 0 0 1 9 0v3" />
  </svg>
);

const IconBox = (props) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M21 8 12 3 3 8l9 5 9-5Z" />
    <path d="M3 8v8l9 5 9-5V8" />
    <path d="M12 13v8" />
  </svg>
);

const IconTag = (props) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M20.5 12.5 12 21l-9-9V4h8l9.5 8.5Z" />
    <circle cx="7.5" cy="7.5" r="1.25" fill="currentColor" stroke="none" />
  </svg>
);

const IconUser = (props) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="8" r="3.5" />
    <path d="M4.5 20c1.5-4 4.2-6 7.5-6s6 2 7.5 6" />
  </svg>
);

const IconPhone = (props) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M6 3h3l1.5 4.5L8 9.2a12 12 0 0 0 6.8 6.8l1.7-2.5L21 15v3a2 2 0 0 1-2.2 2A17 17 0 0 1 4 5.2 2 2 0 0 1 6 3Z" />
  </svg>
);

const IconMail = (props) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3.5 6 8.5 7 8.5-7" />
  </svg>
);

const IconHome = (props) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M4 11.5 12 4l8 7.5" />
    <path d="M6 10v9h12v-9" />
  </svg>
);

const IconPin = (props) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.5C5 14.9 12 21 12 21Z" />
    <circle cx="12" cy="9.5" r="2.2" />
  </svg>
);

const IconShield = (props) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 3.5 5 6v6c0 4.6 3 8 7 9 4-1 7-4.4 7-9V6l-7-2.5Z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

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

  try {
    const payableAmount = Math.round(
      total - discountAmount
    );

    const { data } = await axios.post(
      "https://sri-laxmi-fashion.onrender.com/create-order",
      {
        amount: payableAmount,
      }
    );
console.log(import.meta.env.VITE_RAZORPAY_KEY_ID);

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,

      amount: data.amount,
      currency: data.currency,
      order_id: data.id,

      name: "Sri Laxmi Fashion",

      description: "Order Payment",

      handler: async function (response) {
        const orderId =
          "SLF" +
          Math.floor(Math.random() * 100000);

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

          items: cartItems,

          total: payableAmount,

          discount: discountAmount,

          couponApplied,

          paymentStatus: "Paid",

          razorpayOrderId:
            response.razorpay_order_id,

          razorpayPaymentId:
            response.razorpay_payment_id,

          status: "Pending",

          date:
            new Date().toLocaleDateString(),
        };

        await addDoc(
          collection(db, "orders"),
          newOrder
        );

        // Update stock
        for (const item of cartItems) {
          const productRef = doc(
            db,
            "products",
            item.id
          );

          const productSnap =
            await getDoc(productRef);

          if (productSnap.exists()) {
            const currentStock =
              productSnap.data().stock || 0;

            await updateDoc(productRef, {
              stock: Math.max(
                currentStock - item.quantity,
                0
              ),
            });
          }
        }

        localStorage.setItem(
          "lastOrderId",
          orderId
        );

        clearCart();

        window.location.href =
          "/order-success";
      },

      prefill: {
        name,
        contact: phone,
      },

      theme: {
        color: "#fbbf24",
      },
    };

    const razorpay =
      new window.Razorpay(options);

    razorpay.on(
      "payment.failed",
      function () {
        toast.error("Payment Failed");
      }
    );

    razorpay.open();
  } catch (error) {
    console.error(error);

    toast.error(
      "Unable to start payment."
    );
  }
};

  return (
    <div className="sl-checkout">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=Jost:wght@300;400;500;600&display=swap');

          .sl-checkout {
            --bg: #0a0a0b;
            --card-bg: #17171a;
            --card-bg-alt: #1c1c20;
            --border: rgba(201,169,106,0.16);
            --border-strong: rgba(201,169,106,0.35);
            --gold: #c9a86a;
            --gold-bright: #e9d6a3;
            --gold-deep: #8a6d34;
            --text: #f6f4ef;
            --text-soft: #a9a7a1;
            --success: #9fc98a;
            --error: #e08a7d;
            --radius: 20px;
            font-family: 'Jost', sans-serif;
            color: var(--text);
            background:
              radial-gradient(circle at 15% 0%, rgba(201,169,106,0.10), transparent 45%),
              radial-gradient(circle at 90% 20%, rgba(201,169,106,0.07), transparent 40%),
              var(--bg);
            min-height: 100vh;
            padding: 28px 16px 60px;
          }

          .sl-checkout * { box-sizing: border-box; }

          .sl-inner {
            max-width: 1100px;
            margin: 0 auto;
          }

          .sl-header {
            text-align: center;
            margin-bottom: 28px;
          }

          .sl-header-icon {
            width: 46px;
            height: 46px;
            margin: 0 auto 14px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--gold-bright);
            background: linear-gradient(145deg, rgba(201,169,106,0.18), rgba(201,169,106,0.03));
            border: 1px solid var(--border-strong);
          }

          .sl-eyebrow {
            letter-spacing: 3px;
            font-size: 11px;
            text-transform: uppercase;
            color: var(--gold);
            margin: 0 0 6px;
          }

          .sl-title {
            font-family: 'Playfair Display', serif;
            font-weight: 600;
            font-size: 30px;
            margin: 0;
            letter-spacing: 0.3px;
          }

          .sl-layout {
            display: grid;
            grid-template-columns: 1fr;
            gap: 18px;
            align-items: start;
          }

          .sl-aside, .sl-main {
            display: flex;
            flex-direction: column;
            gap: 18px;
          }

          .sl-card {
            background: linear-gradient(180deg, var(--card-bg), var(--card-bg-alt));
            border: 1px solid var(--border);
            border-radius: var(--radius);
            padding: 22px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.35);
          }

          .sl-card-header {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 16px;
            color: var(--gold-bright);
          }

          .sl-card-header h2 {
            font-family: 'Playfair Display', serif;
            font-weight: 600;
            font-size: 18px;
            margin: 0;
            color: var(--text);
            letter-spacing: 0.2px;
          }

          .sl-divider {
            height: 1px;
            background: linear-gradient(90deg, transparent, var(--border-strong), transparent);
            margin: 14px 0;
          }

          .sl-summary-row {
            display: flex;
            justify-content: space-between;
            font-size: 14.5px;
            color: var(--text-soft);
            padding: 6px 0;
          }

          .sl-discount span:last-child {
            color: var(--success);
          }

          .sl-total-row {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            margin-top: 10px;
            padding-top: 14px;
            border-top: 1px dashed var(--border-strong);
          }

          .sl-total-row span:first-child {
            font-size: 14px;
            color: var(--text-soft);
            text-transform: uppercase;
            letter-spacing: 1.5px;
          }

          .sl-total-row span:last-child {
            font-family: 'Playfair Display', serif;
            font-size: 26px;
            font-weight: 600;
            color: var(--gold-bright);
          }

          .sl-coupon-input-row {
            display: flex;
            gap: 10px;
          }

          .sl-coupon-input-row input {
            flex: 1;
          }

          .sl-btn-apply {
            padding: 0 20px;
            background: transparent;
            color: var(--gold-bright);
            border: 1px solid var(--border-strong);
            border-radius: 12px;
            cursor: pointer;
            font-family: 'Jost', sans-serif;
            font-weight: 500;
            font-size: 14px;
            letter-spacing: 0.4px;
            transition: background 0.2s ease, color 0.2s ease;
            white-space: nowrap;
          }

          .sl-btn-apply:hover {
            background: var(--gold);
            color: #14140f;
          }

          .sl-coupon-msg {
            margin: 12px 0 0;
            font-size: 13.5px;
            font-weight: 500;
          }

          .sl-coupon-msg.sl-success { color: var(--success); }
          .sl-coupon-msg.sl-error { color: var(--error); }

          .sl-field-group { margin-bottom: 12px; }

          .sl-grid-2 {
            display: grid;
            grid-template-columns: 1fr;
            gap: 12px;
            margin-bottom: 12px;
          }

          .sl-input-wrap {
            position: relative;
            display: flex;
            align-items: center;
          }

          .sl-input-wrap svg {
            position: absolute;
            left: 14px;
            color: var(--gold);
            pointer-events: none;
          }

          .sl-input-wrap input {
            width: 100%;
            padding-left: 42px;
          }

          .sl-checkout input,
          .sl-checkout select {
            width: 100%;
            padding: 14px 15px;
            border-radius: 12px;
            border: 1px solid var(--border);
            background: #101012;
            color: var(--text);
            font-family: 'Jost', sans-serif;
            font-size: 15px;
            outline: none;
            transition: border-color 0.2s ease, box-shadow 0.2s ease;
          }

          .sl-checkout input::placeholder { color: #75747a; }

          .sl-checkout input:focus,
          .sl-checkout select:focus {
            border-color: var(--gold);
            box-shadow: 0 0 0 3px rgba(201,169,106,0.15);
          }

          .sl-secure-line {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 13.5px;
            color: var(--text-soft);
            margin: 0 0 16px;
          }

          .sl-secure-line svg { color: var(--gold); flex-shrink: 0; }

          .sl-payment-methods {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-bottom: 22px;
          }

          .sl-pay-pill {
            font-size: 12.5px;
            padding: 7px 13px;
            border-radius: 999px;
            border: 1px solid var(--border);
            color: var(--text-soft);
            background: rgba(255,255,255,0.02);
          }

          .sl-btn-pay {
            width: 100%;
            padding: 18px;
            background: linear-gradient(135deg, var(--gold-bright), var(--gold) 55%, var(--gold-deep));
            color: #16140c;
            border: none;
            border-radius: 999px;
            cursor: pointer;
            font-family: 'Jost', sans-serif;
            font-weight: 600;
            font-size: 16.5px;
            letter-spacing: 0.3px;
            box-shadow: 0 12px 28px rgba(201,169,106,0.28);
            transition: transform 0.15s ease, box-shadow 0.15s ease;
          }

          .sl-btn-pay:hover {
            transform: translateY(-2px);
            box-shadow: 0 16px 34px rgba(201,169,106,0.38);
          }

          .sl-btn-pay:active { transform: translateY(0); }

          @media (min-width: 640px) {
            .sl-grid-2 { grid-template-columns: 1fr 1fr; }
          }

          @media (min-width: 1024px) {
            .sl-checkout { padding: 44px 32px 70px; }
            .sl-layout {
              grid-template-columns: 360px 1fr;
              gap: 26px;
            }
            .sl-aside {
              position: sticky;
              top: 28px;
            }
            .sl-title { font-size: 34px; }
          }
        `}
      </style>

      <div className="sl-inner">
        <div className="sl-header">
          <div className="sl-header-icon"><IconLock /></div>
          <p className="sl-eyebrow">Sri Laxmi Fashion</p>
          <h1 className="sl-title">Secure Checkout</h1>
        </div>

        <div className="sl-layout">
          <aside className="sl-aside">
            <section className="sl-card">
              <div className="sl-card-header">
                <IconBox />
                <h2>Order Summary</h2>
              </div>

              <div className="sl-summary-row">
                <span>Total Items</span>
                <span>{cartItems.length}</span>
              </div>

              <div className="sl-summary-row">
                <span>Subtotal</span>
                <span>₹{total}</span>
              </div>

              {couponApplied && (
                <div className="sl-summary-row sl-discount">
                  <span>Discount</span>
                  <span>-₹{discountAmount.toFixed(0)}</span>
                </div>
              )}

              <div className="sl-total-row">
                <span>Total</span>
                <span>₹{(total - discountAmount).toFixed(0)}</span>
              </div>
            </section>

            <section className="sl-card">
              <div className="sl-card-header">
                <IconTag />
                <h2>Have a Coupon?</h2>
              </div>

              <div className="sl-coupon-input-row">
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
                  className="sl-btn-apply"
                >
                  Apply
                </button>
              </div>

              {couponMessage && (
                <p
                  className={`sl-coupon-msg ${
                    couponApplied ? "sl-success" : "sl-error"
                  }`}
                >
                  {couponMessage}
                </p>
              )}
            </section>
          </aside>

          <form onSubmit={handleSubmit} className="sl-main">
            <section className="sl-card">
              <div className="sl-card-header">
                <IconUser />
                <h2>Customer Information</h2>
              </div>

              <div className="sl-field-group">
                <div className="sl-input-wrap">
                  <IconUser />
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) =>
                      setName(e.target.value)
                    }
                    required
                  />
                </div>
              </div>

              <div className="sl-grid-2">
                <div className="sl-input-wrap">
                  <IconPhone />
                  <input
                    type="tel"
                    placeholder="Mobile Number"
                    value={phone}
                    onChange={(e) =>
                      setPhone(e.target.value)
                    }
                    required
                  />
                </div>

                <div className="sl-input-wrap">
                  <IconMail />
                  <input
                    type="email"
                    placeholder="Email (Optional)"
                  />
                </div>
              </div>
            </section>

            <section className="sl-card">
              <div className="sl-card-header">
                <IconHome />
                <h2>Delivery Address</h2>
              </div>

              <div className="sl-grid-2">
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
              </div>

              <div className="sl-grid-2">
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
              </div>

              <div className="sl-grid-2">
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
              </div>

              <div className="sl-input-wrap">
                <IconPin />
                <input
                  type="text"
                  placeholder="Landmark (Optional)"
                  value={landmark}
                  onChange={(e) =>
                    setLandmark(e.target.value)
                  }
                />
              </div>
            </section>

            <section className="sl-card">
              <div className="sl-card-header">
                <IconShield />
                <h2>Payment</h2>
              </div>

              <p className="sl-secure-line">
                <IconLock />
                Secure Payments by Razorpay
              </p>

              <div className="sl-payment-methods">
                {[
                  "UPI",
                  "Google Pay",
                  "PhonePe",
                  "Paytm",
                  "Debit Card",
                  "Credit Card",
                  "Net Banking",
                ].map((method) => (
                  <span key={method} className="sl-pay-pill">
                    {method}
                  </span>
                ))}
              </div>

              <button type="submit" className="sl-btn-pay">
                Pay Securely · ₹{(total - discountAmount).toFixed(0)}
              </button>
            </section>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
