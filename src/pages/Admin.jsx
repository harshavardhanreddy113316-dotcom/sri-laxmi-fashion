import ShippingLabel from "../components/ShippingLabel";
import { useState, useEffect } from "react";
import logo from "../images/logo.jpeg";
import "./Admin.css";
import {
  getProducts,
  deleteProduct,
} from "../services/productService";
import AddProductModal from "../components/AddProductModal";
import EditProductModal from "../components/EditProductModal";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

function Admin() {
const [section, setSection] = useState("dashboard");
const [settingSection, setSettingSection] =
  useState("store");
const [couponCode, setCouponCode] = useState("");
const [discount, setDiscount] = useState("");
const [expiryDate, setExpiryDate] = useState("");  
const [couponRefresh, setCouponRefresh] =
  useState(false);
const [productList, setProductList] =
  useState([]);
const [category, setCategory] = useState("jewellery");
  const [searchTerm, setSearchTerm] = useState("");
const [deletedProducts, setDeletedProducts] = useState(() => {
  return (
    JSON.parse(
      localStorage.getItem("deletedProducts")
    ) || []
  );
});

const [showAddProduct, setShowAddProduct] = useState(false);
const [showEditProduct, setShowEditProduct] = useState(false);
const [selectedProduct, setSelectedProduct] = useState(null);
const [newProduct, setNewProduct] = useState({
  name: "",
  category: "Jewellery",
  price: "",
  stock: "",
  description: "",
});

const [couponType, setCouponType] =
  useState("Percentage");

const [minimumOrder, setMinimumOrder] =
  useState("");
const [currentPassword, setCurrentPassword] =
  useState("");

const [newPassword, setNewPassword] =
  useState("");

const [confirmPassword, setConfirmPassword] =
  useState("");

const [securityQuestion, setSecurityQuestion] =
  useState("");

const [securityAnswer, setSecurityAnswer] =
  useState("");
  const [storeSettings, setStoreSettings] = useState(() => {
  return JSON.parse(
    localStorage.getItem("storeSettings")
  ) || {
    storeName: "",
    ownerName: "",
    mobile: "",
    whatsapp: "",
    email: "",
    address: "",
    maps: "",
    instagram: "",
  };
});

  const [orders, setOrders] = useState([]);
  const totalSales = orders.reduce(
  (sum, order) => sum + order.total,
  0
);

const pendingOrders = orders.filter(
  (order) => order.status !== "Delivered"
).length;

const deliveredOrders = orders.filter(
  (order) => order.status === "Delivered"
).length;

const lowStockProducts = productList.filter(
  (product) => Number(product.stock) > 0 && Number(product.stock) <= 5
).length;

  const updateTrackingNumber = (
  orderId,
  trackingId
) => {
 

const updateTrackingLink = (
  orderId,
  trackingLink
) => {
  const updatedOrders = orders.map((order) => {
    if (order.orderId === orderId) {
      return {
        ...order,
        trackingLink,
      };
    }

    return order;
  });

  setOrders(updatedOrders);

  localStorage.setItem(
    "orders",
    JSON.stringify(updatedOrders)
  );
};
  const updatedOrders = orders.map((order) => {
    if (order.orderId === orderId) {
      return {
        ...order,
        trackingId,
        trackingLink,
      };
    }

    return order;
  });

  setOrders(updatedOrders);

  localStorage.setItem(
    "orders",
    JSON.stringify(updatedOrders)
  );
};

const loadProducts = async () => {
  try {
    const data = await getProducts();
    setProductList(data);
  } catch (error) {
    console.error("Error loading products:", error);
  }
};

useEffect(() => {
  loadProducts();

  const unsubscribe = onSnapshot(
    collection(db, "orders"),
    (snapshot) => {
      const orderList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setOrders(orderList);
    }
  );

  return () => unsubscribe();
}, []);

const updateStatus = async (id, newStatus) => {
  try {
    await updateDoc(doc(db, "orders", id), {
      status: newStatus,
    });

    alert("✅ Status updated");
  } catch (error) {
  console.error(error);
  alert(error.message);
}
};
const deleteOrder = async (id) => {
  const confirmDelete = window.confirm(
    "Are you sure you want to delete this order?"
  );

  if (!confirmDelete) return;

  try {
    await deleteDoc(doc(db, "orders", id));

    alert("✅ Order deleted successfully");
  } catch (error) {
    console.error(error);

    alert("❌ Failed to delete order");
  }
};

const saveStoreSettings = () => {
  localStorage.setItem(
    "storeSettings",
    JSON.stringify(storeSettings)
  );

  alert("✅ Store Settings Saved");
};
const saveSecuritySettings = () => {
  const currentStoredPassword =
    localStorage.getItem("adminPassword") ||
    "Anil777";

  if (currentPassword !== currentStoredPassword) {
    alert("❌ Current password is incorrect.");
    return;
  }

  if (newPassword !== confirmPassword) {
    alert("❌ Passwords do not match.");
    return;
  }

  if (!securityQuestion || !securityAnswer) {
    alert(
      "❌ Please select a security question and enter the answer."
    );
    return;
  }

  localStorage.setItem(
    "adminPassword",
    newPassword
  );

  localStorage.setItem(
    "securityQuestion",
    securityQuestion
  );

  localStorage.setItem(
    "securityAnswer",
    securityAnswer
  );

  alert("✅ Security settings updated.");

  setCurrentPassword("");
  setNewPassword("");
  setConfirmPassword("");
};



useEffect(() => {
  localStorage.setItem(
    "deletedProducts",
    JSON.stringify(deletedProducts)
  );
}, [deletedProducts]);

  return (
    <div className="admin-container">
      <div className="sidebar">
        <div className="logo-section">
          <img src={logo} alt="Logo" className="logo" />

          <h2>Sri Laxmi Fashion</h2>
          <p>Admin Panel</p>
        </div>

        <hr />

        <button onClick={() => setSection("dashboard")}>
          📊 Dashboard
        </button>

        <button onClick={() => setSection("orders")}>
          📦 Orders
        </button>

        <button onClick={() => setSection("delivered")}>
          ✅ Delivered Orders
        </button>
        <button onClick={() => setSection("products")}>
          🛍 Products
        </button>

        <button onClick={() => setSection("sales")}>
          🏪 Store Sales
        </button>

        <button onClick={() => setSection("analysis")}>
          📈 Sales Analysis
        </button>

        <button onClick={() => setSection("coupons")}>
          🎟 Coupons
        </button>

        <button onClick={() => setSection("settings")}>
          ⚙ Settings
        </button>

        <button
  onClick={() => {
    localStorage.removeItem("adminLoggedIn");
    window.location.href = "/admin-login";
  }}
>
  🚪 Logout
</button>

      </div>

      <div className="content">
        <h1>Sri Laxmi Fashion Admin</h1>

        {section === "dashboard" && (
         <>
  <h2>📊 Dashboard Overview</h2>

  <div className="dashboard-grid">

    <div className="card">
      <h3>📦 Total Orders</h3>
      <h1>{orders.length}</h1>
    </div>

    <div className="card">
      <h3>⏳ Pending Orders</h3>
      <h1>{pendingOrders}</h1>
    </div>

    <div className="card">
      <h3>✅ Delivered Orders</h3>
      <h1>{deliveredOrders}</h1>
    </div>

    <div className="card">
      <h3>💰 Revenue</h3>
      <h1>₹{totalSales}</h1>
    </div>

    <div className="card">
      <h3>🛍 Products</h3>
      <h1>{productList.length}</h1>
    </div>

    <div className="card">
      <h3>⚠ Low Stock</h3>
      <h1>{lowStockProducts}</h1>
    </div>

  </div>
</>
        )}

        {section === "orders" && (
          <>
            <h2
              style={{
                marginBottom: "30px",
                fontSize: "35px",
              }}
            >
              📦 Orders
            </h2>

            {orders.length === 0 ? (
              <h2>No Orders Yet</h2>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(350px, 1fr))",
                  gap: "20px",
                }}
              >
                {orders
                 .filter(
                    (order) => order.status !== "Delivered"
                    )
                 .slice()
                 .reverse()
                  .map((order, index) => (
                    <div
                      key={index}
                      style={{
                        background: "#1f2937",
                        padding: "25px",
                        borderRadius: "20px",
                        boxShadow:
                          "0 0 15px rgba(0,0,0,0.3)",
                      }}
                    >
                      <h2 style={{ color: "#fbbf24" }}>
                        {order.orderId}
                      </h2>

                      <p>
                        👤 {order.customerName}
                      </p>

                      <p>
                        📞 {order.phone}
                      </p>

                      <p>
                        📅 {order.date}
                      </p>

                      <hr style={{ margin: "15px 0" }} />

                      <h3>🏠 Address</h3>

                      <p>{order.house}</p>

                      <p>{order.street}</p>

                      <p>
                        {order.city},{" "}
                        {order.district}
                      </p>

                      <p>
                        {order.stateName} -{" "}
                        {order.pincode}
                      </p>

                      <hr style={{ margin: "15px 0" }} />

                      <h3>Products</h3>

                      {order.items.map((item, i) => (
                        <p key={i}>
                          • {item.name} ×{" "}
                          {item.quantity || 1}
                        </p>
                      ))}

                      <hr style={{ margin: "15px 0" }} />

                      <h2
                        style={{
                          color: "#22c55e",
                        }}
                      >
                        ₹{order.total}
                      </h2>

                      <hr style={{ margin: "15px 0" }} />

<h3>🚚 Tracking Number</h3>

<input
  type="text"
  placeholder="India Post Tracking ID"
  defaultValue={order.trackingId || ""}
  onBlur={(e) =>
    updateTrackingNumber(
      order.orderId,
      e.target.value
    )
  }
  style={{
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "none",
    marginTop: "10px",
    background: "#374151",
    color: "white",
  }}
/>
<input
  type="text"
  placeholder="Courier Tracking Link"
  defaultValue={order.trackingLink || ""}
  onBlur={(e) =>
    updateTrackingLink(
      order.orderId,
      order.trackingId,
      e.target.value
    )
  }
  style={{
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "none",
    marginTop: "10px",
    background: "#374151",
    color: "white",
  }}
/>

<p
  style={{
    marginTop: "10px",
    color: "#60a5fa",
  }}
>
  {order.trackingId || "No Tracking Number"}
</p>

                      <h3>
                        Status:
                        <span
                          style={{
                            color:
                              order.status ===
                              "Delivered"
                                ? "#22c55e"
                                : order.status ===
                                  "Shipped"
                                ? "#3b82f6"
                                : order.status ===
                                  "Packed"
                                ? "#f59e0b"
                                : "#ef4444",
                          }}
                        >
                          {" "}
                          {order.status}
                        </span>
                      </h3>

                      <div
                        style={{
                          display: "flex",
                          gap: "10px",
                          marginTop: "20px",
                          flexWrap: "wrap",
                        }}
                      >
                        <button
                          onClick={() =>
                            updateStatus(
                              order.id,
                              "Packed"
                            )
                          }
                          style={{
                            background: "#f59e0b",
                            color: "white",
                            border: "none",
                            padding: "10px",
                            borderRadius: "8px",
                            cursor: "pointer",
                          }}
                        >
                          📦 Packed
                        </button>

                        <button
                          onClick={() =>
                            updateStatus(
                              order.id,
                              "Shipped"
                            )
                          }
                          style={{
                            background: "#3b82f6",
                            color: "white",
                            border: "none",
                            padding: "10px",
                            borderRadius: "8px",
                            cursor: "pointer",
                          }}
                        >
                          🚚 Shipped
                        </button>

                        <button
                          onClick={() =>
                            updateStatus(
                              order.id,
                              "Delivered"
                            )
                          }
                          style={{
                            background: "#22c55e",
                            color: "white",
                            border: "none",
                            padding: "10px",
                            borderRadius: "8px",
                            cursor: "pointer",
                          }}
                        >
                          ✅ Delivered
                        </button>

                       <button
  onClick={() => {
    localStorage.setItem(
      "printOrder",
      JSON.stringify(order)
    );

    window.open("/shipping-label", "_blank");
  }}
  style={{
    background: "#6d28d9",
    color: "white",
    border: "none",
    padding: "10px",
    borderRadius: "8px",
    cursor: "pointer",
    width: "100%",
    marginTop: "10px",
  }}
>
  🖨 Print Shipping Label
</button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </>
        )}

        {section === "delivered" && (
  <>
    <h2>✅ Delivered Orders</h2>

    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          "repeat(auto-fit, minmax(350px, 1fr))",
        gap: "20px",
      }}
    >
      {orders
        .filter((order) => order.status === "Delivered"
    )
        .map((order, index) => (
          <div
            key={index}
            style={{
              background: "#1f2937",
              padding: "25px",
              borderRadius: "20px",
            }}
          >
            <h2
              style={{
                color: "#22c55e",
              }}
            >
              {order.orderId}
            </h2>

            <p>
              👤 {order.customerName}
            </p>

            <p>
              📞 {order.phone}
            </p>

            <p>
              ₹{order.total}
            </p>
            <button
  onClick={() =>
    updateStatus(
      order.id,
      "Shipped"
    )
  }
  style={{
    marginTop: "20px",
    marginRight: "10px",
    background: "#3b82f6",
    color: "white",
    border: "none",
    padding: "10px",
    borderRadius: "8px",
    cursor: "pointer",
  }}
>
  ↩ Undo
</button>

            <button
              onClick={() =>
             deleteOrder(order.id)
             }
              style={{
                marginTop: "20px",
                background: "#ef4444",
                color: "white",
                border: "none",
                padding: "10px",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              🗑 Deletes
            </button>
          </div>
        ))}
    </div>
  </>
)}

       {section === "products" && (
  <>
    <h2
      style={{
        marginBottom: "25px",
      }}
    >
      🛍 Products
    </h2>

   <button
  className="action-btn"
  style={{
    marginBottom: "25px",
  }}
  onClick={() => setShowAddProduct(true)}
>
  ➕ Add Product
</button>

{showAddProduct && (
<AddProductModal
  onClose={() => setShowAddProduct(false)}
  productList={productList}
  setProductList={setProductList}
/>
)}

{showEditProduct && selectedProduct && (
  <EditProductModal
    product={selectedProduct}
    onClose={() => {
      setShowEditProduct(false);
      setSelectedProduct(null);
    }}
    onUpdated={loadProducts}
  />
)}

<div
  style={{
    display: "flex",
    gap: "15px",
    marginBottom: "25px",
  }}
>
  <button
    onClick={() => setCategory("jewellery")}
    style={{
      padding: "12px 25px",
      border: "none",
      borderRadius: "10px",
      cursor: "pointer",
      background:
        category === "jewellery"
          ? "#d4af37"
          : "#374151",
      color: "white",
      fontWeight: "bold",
    }}
  >
    👑 Jewellery
  </button>

  <button
    onClick={() => setCategory("fashion")}
    style={{
      padding: "12px 25px",
      border: "none",
      borderRadius: "10px",
      cursor: "pointer",
      background:
        category === "fashion"
          ? "#3b82f6"
          : "#374151",
      color: "white",
      fontWeight: "bold",
    }}
  >
    👕 Fashion
  </button>
</div>

<input
  type="text"
  placeholder="🔍 Search by Product Name..."
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  style={{
    width: "100%",
    padding: "15px",
    marginBottom: "25px",
    borderRadius: "10px",
    border: "none",
    background: "#374151",
    color: "white",
    fontSize: "16px",
  }}
/>

<p
  style={{
    marginBottom: "15px",
    color: "#9ca3af",
  }}
>
  Showing {
    productList
      .filter(
        (product) =>
          product.category.toLowerCase() === category
      )
      .filter((product) =>
        product.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      ).length
  } products
</p>

    <div
      style={{
        display: "grid",
        gap: "20px",
      }}
    >
     {productList
  .filter(
    (product) =>
      product.category.toLowerCase() === category
  )
  .filter((product) =>
    product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  )
  .map((product) => (
        <div
          key={product.id}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#1f2937",
            padding: "20px",
            borderRadius: "15px",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "20px",
              alignItems: "center",
            }}
          >

            {product.image ? (
  <img
    src={product.image}
    alt={product.name}
    style={{
      width: "80px",
      height: "80px",
      objectFit: "cover",
      borderRadius: "10px",
    }}
  />
) : (
  <div
    style={{
      width: "80px",
      height: "80px",
      background: "#374151",
      borderRadius: "10px",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      color: "white",
      fontSize: "12px",
    }}
  >
    No Image
  </div>
)}          

            <div>
              <h3>{product.name}</h3>

              <p>₹{product.price}</p>

              <p>
                Stock : {product.stock}
              </p>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: "10px",
            }}
          >
            <button
  onClick={() => {
    setSelectedProduct(product);
    setShowEditProduct(true);
  }}
  style={{
    background: "#3b82f6",
    color: "white",
    border: "none",
    padding: "10px 15px",
    borderRadius: "8px",
    cursor: "pointer",
  }}
>
  ✏ Edit
</button>

           
     <button
  onClick={async () => {
    console.log("PRODUCT =", product);
    console.log("PRODUCT ID =", product.id);
    console.log("TYPE =", typeof product.id);

    const confirmDelete = window.confirm(
      `Delete "${product.name}"?`
    );

    if (!confirmDelete) return;

    try {
      await deleteProduct(product.id);

      setProductList((prev) =>
        prev.filter((item) => item.id !== product.id)
      );

      alert("✅ Product deleted successfully");
    } catch (error) {
      console.error(error);
      alert("❌ Failed to delete product");
    }
  }}
  style={{
    background: "#ef4444",
    color: "white",
    border: "none",
    padding: "10px 15px",
    borderRadius: "8px",
    cursor: "pointer",
  }}
>
  🗑 Delete
</button>
          </div>
        </div>
      ))}
    </div>
  </>
)}

        {section === "sales" && (
          <>
            <h2>🏪 Store Sales</h2>

            <input
              type="text"
              placeholder="Product Name"
            />

            <input
              type="number"
              placeholder="Quantity"
            />

            <select>
              <option>Cash</option>
              <option>UPI</option>
            </select>

            <select>
              <option>In-Store</option>
              <option>Online</option>
            </select>

            <button className="submit-btn">
              Add Sale
            </button>
          </>
        )}

        {section === "analysis" && (
          <>
            <h2>📈 Sales Analysis</h2>

            <div className="dashboard-grid">
              <div className="card">
                <h3>Today's Sales</h3>
                <h1>₹0</h1>
              </div>

              <div className="card">
                <h3>This Month</h3>
                <h1>₹0</h1>
              </div>

              <div className="card">
                <h3>Best Seller</h3>
                <h1>-</h1>
              </div>

              <div className="card">
                <h3>Total Sales</h3>
                <h1>₹0</h1>
              </div>
            </div>
          </>
        )}

        {section === "coupons" &&
  couponRefresh >= 0 && (
  <>
    <h2>🎟 Coupons</h2>

    <input
      type="text"
      placeholder="Coupon Code"
      value={couponCode}
      onChange={(e) =>
        setCouponCode(e.target.value)
      }
    />

    <input
      type="number"
      placeholder="Discount %"
      value={discount}
      onChange={(e) =>
        setDiscount(e.target.value)
      }
    />

    <select
  value={couponType}
  onChange={(e) =>
    setCouponType(e.target.value)
  }
>
  <option>Percentage</option>

  <option>Flat Discount</option>

  <option>Free Delivery</option>

  <option>
    Percentage + Free Delivery
  </option>

  <option>
    Flat + Free Delivery
  </option>
</select>

    <input
      type="date"
      value={expiryDate}
      onChange={(e) =>
        setExpiryDate(e.target.value)
      }
    />

    <input
  type="number"
  placeholder="Minimum Order (Optional)"
  value={minimumOrder}
  onChange={(e) =>
    setMinimumOrder(e.target.value)
  }
/>

    <button
      className="submit-btn"
      onClick={() => {
        const coupons =
          JSON.parse(
            localStorage.getItem("coupons")
          ) || [];

        coupons.push({
        code: couponCode,
        discount: Number(discount),
        type: couponType,
        minimumOrder: Number(minimumOrder),
        expiry: expiryDate,
      });

        localStorage.setItem(
          "coupons",
          JSON.stringify(coupons)
        );

        alert("Coupon Created!");

        setCouponCode("");
        setDiscount("");
        setExpiryDate("");
      }}
    >
      Create Coupon
    </button>

    <h3 style={{ marginTop: "30px" }}>
      Existing Coupons
    </h3>

    {(
  JSON.parse(
    localStorage.getItem("coupons")
  ) || []
).map((coupon, index) => (
      <div
        key={index}
        style={{
          background: "#1f2937",
          padding: "15px",
          marginTop: "10px",
          borderRadius: "10px",
        }}
      >
        <h3>{coupon.code}</h3>

        <p>
          Discount: {coupon.discount}%
        </p>

      <p>
  Type: {coupon.type}
</p>

<p>
  Discount: {coupon.discount}
</p>

<p>
  Minimum Order:
  ₹{coupon.minimumOrder || 0}
</p>

        <button
  onClick={() => {
    const coupons =
      JSON.parse(
        localStorage.getItem(
          "coupons"
        )
      ) || [];

    const updatedCoupons =
      coupons.filter(
        (_, i) => i !== index
      );

    localStorage.setItem(
      "coupons",
      JSON.stringify(updatedCoupons)
    );

    setCouponRefresh(
      !couponRefresh
    );
  }}
  style={{
    background: "#ef4444",
    color: "white",
    border: "none",
    padding: "10px 15px",
    borderRadius: "8px",
    cursor: "pointer",
    marginTop: "10px",
  }}
>
  🗑 Delete Coupon
</button>
      </div>
    ))}
  </>
)}

    {section === "settings" && (
  <div
    style={{
      display: "flex",
      gap: "30px",
      marginTop: "20px",
    }}
  >
    {/* Left Menu */}

    <div
      style={{
        width: "250px",
        background: "#1f2937",
        padding: "20px",
        borderRadius: "15px",
      }}
    >
      <h2>⚙ Settings</h2>

      <button
        onClick={() =>
          setSettingSection("store")
        }
        className="action-btn"
      >
        🏪 Store Information
      </button>

      <button
        onClick={() =>
          setSettingSection("delivery")
        }
        className="action-btn"
      >
        🚚 Delivery Settings
      </button>

      <button
        onClick={() =>
          setSettingSection("payment")
        }
        className="action-btn"
      >
        💳 Payment Settings
      </button>

      <button
        onClick={() =>
          setSettingSection("security")
        }
        className="action-btn"
      >
        🔒 Security
      </button>
    </div>

    {/* Right Content */}

    <div
      style={{
        flex: 1,
        background: "#1f2937",
        padding: "30px",
        borderRadius: "15px",
      }}
    >
      {settingSection === "store" && (
        <>
          <h2>🏪 Store Information</h2>

          <input
            type="text"
            placeholder="Store Name"
          />

          <input
            type="text"
            placeholder="Owner Name"
          />

          <input
            type="text"
            placeholder="Mobile Number"
          />

          <input
            type="text"
            placeholder="WhatsApp Number"
          />

          <input
            type="email"
            placeholder="Email"
          />

          <textarea
            placeholder="Store Address"
            rows="4"
          />

          <input
            type="text"
            placeholder="Google Maps Link"
          />

          <input
            type="text"
            placeholder="Instagram Link"
          />

          <button className="submit-btn">
            💾 Save
          </button>
        </>
      )}

      {settingSection === "delivery" && (
        <>
          <h2>🚚 Delivery Settings</h2>

          <input
            type="number"
            placeholder="Delivery Charge"
          />

          <input
            type="number"
            placeholder="Free Delivery Above ₹"
          />

          <button className="submit-btn">
            💾 Save
          </button>
        </>
      )}

      {settingSection === "payment" && (
        <>
          <h2>💳 Payment Settings</h2>

          <input
            type="text"
            placeholder="UPI ID"
          />

          <input
            type="text"
            placeholder="Bank Name"
          />

          <input
            type="text"
            placeholder="Account Holder"
          />

          <input
            type="text"
            placeholder="Account Number"
          />

          <input
            type="text"
            placeholder="IFSC Code"
          />

          <button className="submit-btn">
            💾 Save
          </button>
        </>
      )}

      {settingSection === "security" && (
        
        <>
  <h2>🔒 Security</h2>

  <input
    type="password"
    placeholder="Current Password"
    value={currentPassword}
    onChange={(e) =>
      setCurrentPassword(e.target.value)
    }
  />

  <input
    type="password"
    placeholder="New Password"
    value={newPassword}
    onChange={(e) =>
      setNewPassword(e.target.value)
    }
  />

  <input
    type="password"
    placeholder="Confirm Password"
    value={confirmPassword}
    onChange={(e) =>
      setConfirmPassword(e.target.value)
    }
  />

  <h3
    style={{
      marginTop: "25px",
    }}
  >
    Security Question
  </h3>

  <select
    value={securityQuestion}
    onChange={(e) =>
      setSecurityQuestion(e.target.value)
    }
  >
    <option value="">
      Select a Question
    </option>

   <option value="">
  Select a Security Question
</option>

<option>
  What is your favourite color?
</option>

<option>
  What is your birth village?
</option>

<option>
  What is your favourite food?
</option>

<option>
  What is your favourite place?
</option>

<option>
  What is your lucky number?
</option>

  </select>

  <input
    type="text"
    placeholder="Enter your Answer"
    value={securityAnswer}
    onChange={(e) =>
      setSecurityAnswer(e.target.value)
    }
  />

  <button
    className="submit-btn"
    onClick={saveSecuritySettings}
  >
    💾 Save Security Settings
  </button>
</>
          
        
      )}
    </div>
  </div>
)}
        
      </div>
    </div>
  );
}

export default Admin;