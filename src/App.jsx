import { useState } from "react";
import Contact from "./pages/Contact";
import TrackOrder from "./pages/TrackOrder";
import Admin from "./pages/Admin";
import { Routes, Route, Navigate} from "react-router-dom";
import Home from "./pages/Home";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import AdminLogin from "./pages/AdminLogin"
import ProductDetails from "./pages/ProductDetails"

function App() {
  const [search, setSearch] = useState("");

  const isLoggedIn =
  localStorage.getItem("adminLoggedIn") === "true";

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
  path="/product/:id"
  element={<ProductDetails />}
/>
    </Routes>
  );
}

export default App;