import "./../styles/ShippingLabel.css";
import { useEffect } from "react";

function ShippingLabel() {
  const order = JSON.parse(localStorage.getItem("printOrder"));

  useEffect(() => {
    if (order) {
      setTimeout(() => {
        window.print();
      }, 500);
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

      <div className="header">

        <div className="company-name">
          Sri Laxmi Fashion
        </div>

        <div className="label-name">
          PARCEL LABEL
        </div>

      </div>

      {/* ================= ROW 1: FROM + ORDER DETAILS ================= */}

      <div className="row-top">

        {/* FROM */}

        <div className="from-box">

          <div className="box-title">
            FROM
          </div>

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
            Phone : 7794055777
          </div>

        </div>

        {/* ORDER DETAILS */}

        <div className="order-box">

          <div className="box-title">
            ORDER DETAILS
          </div>

          <div className="detail-row">

            <span>Order ID</span>

            <strong>{order.orderId}</strong>

          </div>

          <div className="detail-row">

            <span>Date</span>

            <strong>{order.date}</strong>

          </div>

          <div className="detail-row">

            <span>Payment</span>

            <strong>{order.paymentStatus}</strong>

          </div>

        </div>

      </div>

      {/* ================= ROW 2: TO (LARGEST SECTION) ================= */}

      <div className="to-box">

        <div className="box-title">
          TO
        </div>

        <div className="customer-name">

          {order.customerName}

        </div>

        <div className="customer-address">

          <div>{order.house}</div>

          <div>{order.street}</div>

          <div>{order.city}</div>

          <div>{order.district}</div>

          <div>
            {order.stateName}
          </div>

          <div>
            {order.pincode}
          </div>

        </div>

        <div className="customer-phone">

          Phone : {order.phone}

        </div>

      </div>

     {/* ================= INDIA POST STICKER ================= */}

<div className="sticker-box">

  <div className="box-title">
    INDIA POST STICKER
  </div>

  <div className="sticker-area">

    Official India Post

    <br />

    QR / Barcode Sticker

    <br />

    <br />

    (Paste Sticker Here)

  </div>

</div>

{/* ================= FOOTER ================= */}

<div className="footer">

  Thank You For Shopping

  <br />

  <span>
    Sri Laxmi Fashion
  </span>

</div>

</div>

);

}

export default ShippingLabel;