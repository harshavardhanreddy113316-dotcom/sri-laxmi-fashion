import "./../styles/ShippingLabel.css";
import { useEffect } from "react";

function ShippingLabel() {

  const order = JSON.parse(
    localStorage.getItem("printOrder")
  );

  useEffect(() => {
    if (order) {
      setTimeout(() => {
        window.print();
      }, 600);
    }
  }, []);

  if (!order) {
    return (
      <div className="label-error">
        <h2>No Order Found</h2>
      </div>
    );
  }

  return (

    <div className="shipping-label">

      {/* ================= HEADER ================= */}

      <div className="label-header">

        <div className="store-name">
          Sri Laxmi Fashion
        </div>

        <div className="label-title">
          ONLINE SHIPPING LABEL
        </div>

      </div>

      {/* ================= FROM ================= */}

      <div className="label-section">

        <div className="section-heading">

          FROM

        </div>

        <div className="address">

          <div className="shop-name">

            Sri Laxmi Fashion

          </div>

          <div>

            Balabhadrapuram

          </div>

          <div>

            Biccavolu Mandal

          </div>

          <div>

            East Godavari

          </div>

          <div>

            Andhra Pradesh - 533343

          </div>

          <div>

            📞 7794055777

          </div>

        </div>

      </div>

      {/* ================= TO ================= */}

      <div className="label-section receiver">

        <div className="section-heading">

          TO

        </div>

        <div className="receiver-name">

          {order.customerName}

        </div>

        <div className="receiver-phone">

          📞 {order.phone}

        </div>

        <div className="receiver-address">

          <div>{order.house}</div>

          <div>{order.street}</div>

          <div>{order.city}</div>

          <div>{order.district}</div>

          <div>

            {order.stateName}

          </div>

          <div>

            PIN - {order.pincode}

          </div>

        </div>

      </div>

      {/* ================= ORDER DETAILS ================= */}

      <div className="order-details">

        <div className="detail-box">

          <span className="detail-title">

            Order ID

          </span>

          <span className="detail-value">

            {order.orderId}

          </span>

        </div>

        <div className="detail-box">

          <span className="detail-title">

            Date

          </span>

          <span className="detail-value">

            {order.date}

          </span>

        </div>

        <div className="detail-box">

          <span className="detail-title">

            Payment

          </span>

          <span className="detail-paid">

            {order.paymentStatus}

          </span>

        </div>

      </div>
            {/* ================= INDIA POST STICKER ================= */}

      <div className="sticker-section">

        <div className="section-heading">
          INDIA POST STICKER
        </div>

        <div className="sticker-box">

          <div className="sticker-title">
            Official India Post
          </div>

          <div className="sticker-subtitle">
            QR / Barcode Sticker
          </div>

          <div className="sticker-note">
            Paste Official Sticker Here
          </div>

        </div>

      </div>

      {/* ================= THANK YOU ================= */}

      <div className="label-footer">

        <div className="thank-you">

          Thank You ❤️

        </div>

        <div className="footer-store">

          Sri Laxmi Fashion

        </div>

      </div>

    </div>

  );

}

export default ShippingLabel;