import ShippingLabel from "./components/ShippingLabel";
import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

import Contact from "./pages/Contact";
import TrackOrder from "./pages/TrackOrder";
import Admin from "./pages/Admin";
import Home from "./pages/Home";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import AdminLogin from "./pages/AdminLogin";
import ProductDetails from "./pages/ProductDetails";

function App() {
  const [search, setSearch] = useState("");

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontSize: "24px",
        }}
      >
        Loading...
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Home
            search={search}
            setSearch={setSearch}
          />
        }
      />

      <Route path="/cart" element={<Cart />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/track" element={<TrackOrder />} />
      <Route path="/admin-login" element={<AdminLogin />} />

      <Route
        path="/admin"
        element={
          isLoggedIn ? (
            <Admin />
          ) : (
            <Navigate to="/admin-login" replace />
          )
        }
      />

      <Route
        path="/order-success"
        element={<OrderSuccess />}
      />

      <Route
        path="/track-order"
        element={<TrackOrder />}
      />

      <Route
        path="/contact"
        element={<Contact />}
      />

      <Route
        path="/shipping-label"
        element={<ShippingLabel />}
      />

      <Route
        path="/product/:id"
        element={
          <ProductDetails
            search={search}
            setSearch={setSearch}
          />
        }
      />
    </Routes>
  );
}

export default App;