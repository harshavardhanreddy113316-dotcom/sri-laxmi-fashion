function Contact() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg,#050816,#111827,#050816)",
        color: "white",
        padding: "20px",
      }}
    >
      {/* Hero */}
      <div
        style={{
          textAlign: "center",
          paddingTop: "80px",
        }}
      >
        <h1
          style={{
            color: "#d4af37",
            fontSize: "60px",
            letterSpacing: "5px",
            marginBottom: "10px",
          }}
        >
          SRI LAXMI
        </h1>

        <h2
          style={{
            fontSize: "35px",
            letterSpacing: "10px",
            marginBottom: "30px",
          }}
        >
          FASHION
        </h2>

        <div
          style={{
            width: "120px",
            height: "3px",
            background: "#d4af37",
            margin: "auto",
          }}
        ></div>

        <p
          style={{
            marginTop: "30px",
            color: "#d4af37",
            fontSize: "24px",
          }}
        >
          ✨ Your Style, Our Passion ✨
        </p>

        <p
          style={{
            color: "#9ca3af",
            marginTop: "20px",
          }}
        >
          Jewellery • Fashion • Elegance
        </p>
      </div>

      {/* Information */}
      <div
        style={{
          marginTop: "80px",
          textAlign: "center",
          lineHeight: "2.5",
        }}
      >
        <h2>📞 Phone</h2>
        <p>7794055777</p>

        <h2>📧 Email</h2>
        <p>srilaxmifashion4@gmail.com</p>

        <h2>📍 Address</h2>

        <p>
          Nandhiramalayam Vidi,
          <br />
          Balabhadrapuram,
          <br />
          Biccavolu Mandal,
          <br />
          East Godavari District,
          <br />
          Andhra Pradesh - 533343
        </p>

        <h2>🕒 Timings</h2>

        <p>9:00 AM - 9:00 PM</p>
      </div>

      {/* Buttons */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "20px",
          flexWrap: "wrap",
          marginTop: "60px",
        }}
      >
        <a
          href="tel:7794055777"
          style={{
            background: "#d4af37",
            color: "black",
            padding: "18px 35px",
            borderRadius: "50px",
            textDecoration: "none",
            fontWeight: "bold",
          }}
        >
          📞 Call
        </a>

        <a
          href="https://wa.me/917794055777"
          style={{
            background: "#25D366",
            color: "white",
            padding: "18px 35px",
            borderRadius: "50px",
            textDecoration: "none",
            fontWeight: "bold",
          }}
        >
          💬 WhatsApp
        </a>

        <a
          href="https://www.instagram.com/srilaxmisarres.slf"
          target="_blank"
          rel="noreferrer"
          style={{
            background: "#E1306C",
            color: "white",
            padding: "18px 35px",
            borderRadius: "50px",
            textDecoration: "none",
            fontWeight: "bold",
          }}
        >
          📷 Instagram
        </a>

        <a
  href="https://maps.app.goo.gl/o8nWaVq2CyZbwBfQ9"
  target="_blank"
  rel="noreferrer"
  style={{
    background: "#2563eb",
    color: "white",
    padding: "18px 35px",
    borderRadius: "50px",
    textDecoration: "none",
    fontWeight: "bold",
  }}
>
  📍 Visit Store
</a>
      </div>

      {/* Footer */}
      <div
        style={{
          textAlign: "center",
          marginTop: "100px",
          color: "#6b7280",
          fontStyle: "italic",
          fontSize: "20px",
        }}
      >
        "Every piece tells a story."
      </div>
    </div>
  );
}

export default Contact;