import ShippingLabel from "../components/ShippingLabel";
import { useState, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
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

const ITEMS_PER_PAGE = 10;

function Admin() {
  const [section, setSection] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingSection, setSettingSection] = useState("store");
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [couponRefresh, setCouponRefresh] = useState(0);
  const [productList, setProductList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [deletedProducts, setDeletedProducts] = useState(() => {
    return (
      JSON.parse(localStorage.getItem("deletedProducts")) || []
    );
  });

  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showEditProduct, setShowEditProduct] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [couponType, setCouponType] = useState("Percentage");
  const [minimumOrder, setMinimumOrder] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [securityQuestion, setSecurityQuestion] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [storeSettings, setStoreSettings] = useState(() => {
    return (
      JSON.parse(localStorage.getItem("storeSettings")) || {
        storeName: "",
        ownerName: "",
        mobile: "",
        whatsapp: "",
        email: "",
        address: "",
        maps: "",
        instagram: "",
      }
    );
  });

  const [orders, setOrders] = useState([]);

  // Table state
  const [selectedIds, setSelectedIds] = useState([]);
  const [sortBy, setSortBy] = useState("name");
  const [sortDir, setSortDir] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [bulkDeleteTarget, setBulkDeleteTarget] = useState(false);

  const totalSales = orders.reduce(
    (sum, order) => sum + (order.total || 0),
    0
  );

  const pendingOrders = orders.filter(
    (order) => order.status !== "Delivered"
  ).length;

  const deliveredOrders = orders.filter(
    (order) => order.status === "Delivered"
  ).length;

  const lowStockProducts = productList.filter(
    (product) =>
      Number(product.stock) > 0 && Number(product.stock) <= 5
  ).length;

  const jewelleryCount = productList.filter(
    (p) => p.category && p.category.trim().toLowerCase() === "jewellery"
  ).length;

  const fashionCount = productList.filter(
    (p) => p.category && p.category.trim().toLowerCase() === "fashion"
  ).length;

  const outOfStockCount = productList.filter(
    (product) => Number(product.stock) <= 0
  ).length;

  const outOfStockList = productList.filter(
    (product) => Number(product.stock) <= 0
  );

  const lowStockList = productList.filter(
    (product) => Number(product.stock) > 0 && Number(product.stock) <= 5
  );

  const recentProducts = [...productList].slice(-5).reverse();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const updateTrackingNumber = (orderId, trackingId) => {
    const updatedOrders = orders.map((order) => {
      if (order.orderId === orderId) {
        return { ...order, trackingId };
      }
      return order;
    });

    setOrders(updatedOrders);
    localStorage.setItem("orders", JSON.stringify(updatedOrders));
  };

  const updateTrackingLink = (orderId, trackingLink) => {
    const updatedOrders = orders.map((order) => {
      if (order.orderId === orderId) {
        return { ...order, trackingLink };
      }
      return order;
    });

    setOrders(updatedOrders);
    localStorage.setItem("orders", JSON.stringify(updatedOrders));
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await getProducts();
      setProductList(data);
    } catch (error) {
      console.error("Error loading products:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
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
      await updateDoc(doc(db, "orders", id), { status: newStatus });
      toast.success(`Order marked as ${newStatus}`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to update status");
    }
  };

  const deleteOrder = async (id) => {
    try {
      await deleteDoc(doc(db, "orders", id));
      toast.success("Order deleted");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete order");
    }
  };

  const saveStoreSettings = () => {
    localStorage.setItem("storeSettings", JSON.stringify(storeSettings));
    toast.success("Store settings saved");
  };

  const saveSecuritySettings = () => {
    const currentStoredPassword =
      localStorage.getItem("adminPassword") || "Anil777";

    if (currentPassword !== currentStoredPassword) {
      toast.error("Current password is incorrect");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (!securityQuestion || !securityAnswer) {
      toast.error("Please select a security question and enter the answer");
      return;
    }

    localStorage.setItem("adminPassword", newPassword);
    localStorage.setItem("securityQuestion", securityQuestion);
    localStorage.setItem("securityAnswer", securityAnswer);

    toast.success("Security settings updated");
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

  const navigateSection = (sec) => {
    setSection(sec);
    setSidebarOpen(false);
    setSelectedIds([]);
    setCurrentPage(1);
  };

  // Product filtering + sorting
  const filteredProducts = useMemo(() => {
    let result = [...productList];

    // Category filter
    if (category !== "all") {
      result = result.filter(
        (p) =>
          p.category &&
          p.category.trim().toLowerCase() === category
      );
    }

    // Stock filter
    if (stockFilter !== "in-stock") {
      if (stockFilter === "low") {
        result = result.filter(
          (p) => Number(p.stock) > 0 && Number(p.stock) <= 5
        );
      } else if (stockFilter === "out") {
        result = result.filter((p) => Number(p.stock) <= 0);
      } else if (stockFilter === "in") {
        result = result.filter((p) => Number(p.stock) > 5);
      }
    }

    // Search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (p) =>
          (p.name && p.name.toLowerCase().includes(term)) ||
          (p.category && p.category.toLowerCase().includes(term))
      );
    }

    // Sort
    result.sort((a, b) => {
      let aVal, bVal;
      switch (sortBy) {
        case "price":
          aVal = Number(a.price) || 0;
          bVal = Number(b.price) || 0;
          break;
        case "stock":
          aVal = Number(a.stock) || 0;
          bVal = Number(b.stock) || 0;
          break;
        case "category":
          aVal = (a.category || "").toLowerCase();
          bVal = (b.category || "").toLowerCase();
          return sortDir === "asc"
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        default:
          aVal = (a.name || "").toLowerCase();
          bVal = (b.name || "").toLowerCase();
          return sortDir === "asc"
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
      }
      return sortDir === "asc" ? aVal - bVal : bVal - aVal;
    });

    return result;
  }, [productList, category, stockFilter, searchTerm, sortBy, sortDir]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortDir("asc");
    }
  };

  const toggleSelectAll = () => {
    const pageIds = paginatedProducts.map((p) => p.id);
    const allSelected = pageIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      setSelectedIds((prev) => [...new Set([...prev, ...pageIds])]);
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteProduct(deleteTarget.id);
      setProductList((prev) =>
        prev.filter((item) => item.id !== deleteTarget.id)
      );
      setSelectedIds((prev) => prev.filter((i) => i !== deleteTarget.id));
      toast.success(`"${deleteTarget.name}" deleted`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete product");
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleBulkDelete = async () => {
    const toDelete = selectedIds;
    if (toDelete.length === 0) return;

    try {
      for (const id of toDelete) {
        await deleteProduct(id);
      }
      setProductList((prev) =>
        prev.filter((item) => !toDelete.includes(item.id))
      );
      setSelectedIds([]);
      toast.success(`${toDelete.length} product(s) deleted`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete some products");
    } finally {
      setBulkDeleteTarget(false);
    }
  };

  const renderSortArrow = (field) => {
    if (sortBy !== field) return <span className="sort-arrow">&#8597;</span>;
    return (
      <span className="sort-arrow active">
        {sortDir === "asc" ? "\u25B2" : "\u25BC"}
      </span>
    );
  };

  const getStockBadgeClass = (stock) => {
    const num = Number(stock);
    if (num <= 0) return "out-of-stock";
    if (num <= 5) return "low-stock";
    return "in-stock";
  };

  const getStockLabel = (stock) => {
    const num = Number(stock);
    if (num <= 0) return "Out";
    if (num <= 5) return "Low";
    return num.toString();
  };

  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  const sectionTitles = {
    dashboard: ["Dashboard", "Overview of your store performance"],
    products: ["Products", "Manage your product inventory"],
    orders: ["Orders", "Manage and fulfil customer orders"],
    delivered: ["Delivered", "Completed customer orders"],
    coupons: ["Coupons", "Create and manage discount coupons"],
    settings: ["Settings", "Manage store and security settings"],
  };

  return (
    <div className="admin-container">
      {/* Mobile header */}
      <div className="admin-mobile-header">
        <button
          className="admin-hamburger"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle menu"
        >
          &#9776;
        </button>
        <h3>Sri Laxmi Fashion</h3>
      </div>

      {/* Overlay */}
      <div
        className={`admin-overlay${sidebarOpen ? " show" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`admin-sidebar${sidebarOpen ? " open" : ""}`}>
        <div className="admin-sidebar-brand">
          <img src={logo} alt="Logo" />
          <div className="admin-sidebar-brand-text">
            <h2>Sri Laxmi Fashion</h2>
            <p>Admin Panel</p>
          </div>
        </div>

        <nav className="admin-sidebar-nav">
          <p className="admin-nav-section-label">Overview</p>
          <button
            className={section === "dashboard" ? "active" : ""}
            onClick={() => navigateSection("dashboard")}
          >
            <span className="nav-icon">&#9632;</span>
            Dashboard
          </button>

          <p className="admin-nav-section-label">Store</p>
          <button
            className={section === "products" ? "active" : ""}
            onClick={() => navigateSection("products")}
          >
            <span className="nav-icon">&#9733;</span>
            Products
            <span className="admin-nav-badge">{productList.length}</span>
          </button>
          <button
            className={section === "coupons" ? "active" : ""}
            onClick={() => navigateSection("coupons")}
          >
            <span className="nav-icon">&#10004;</span>
            Coupons
          </button>

          <p className="admin-nav-section-label">Orders</p>
          <button
            className={section === "orders" ? "active" : ""}
            onClick={() => navigateSection("orders")}
          >
            <span className="nav-icon">&#9744;</span>
            Pending
            {pendingOrders > 0 && (
              <span className="admin-nav-badge">{pendingOrders}</span>
            )}
          </button>
          <button
            className={section === "delivered" ? "active" : ""}
            onClick={() => navigateSection("delivered")}
          >
            <span className="nav-icon">&#10003;</span>
            Delivered
          </button>

          <p className="admin-nav-section-label">System</p>
          <button
            className={section === "settings" ? "active" : ""}
            onClick={() => navigateSection("settings")}
          >
            <span className="nav-icon">&#9881;</span>
            Settings
          </button>
        </nav>

        <div className="admin-sidebar-footer">
          <button
            onClick={() => {
              localStorage.removeItem("adminLoggedIn");
              window.location.href = "/admin-login";
            }}
          >
            <span className="nav-icon">&#8592;</span>
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="admin-main">
        {/* Top bar */}
        <div className="admin-topbar">
          <div className="admin-topbar-left">
            <div>
              <h1 className="admin-topbar-title">
                {sectionTitles[section]?.[0] || "Admin"}
              </h1>
              <p className="admin-topbar-subtitle">
                {sectionTitles[section]?.[1] || ""}
              </p>
            </div>
          </div>
          <div className="admin-topbar-right">
            <div className="admin-topbar-search">
              <span className="admin-topbar-search-icon">&#128269;</span>
              <input
                type="text"
                placeholder="Search anything..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <div className="admin-topbar-profile">
              <div className="admin-topbar-avatar">A</div>
              <div className="admin-topbar-profile-info">
                <div className="admin-topbar-profile-name">Admin</div>
                <div className="admin-topbar-profile-role">Owner</div>
              </div>
            </div>
          </div>
        </div>

        <div className="admin-content">
          {/* ---- DASHBOARD ---- */}
          {section === "dashboard" && (
            <>
              {/* Header */}
              <div className="db-header">
                <h1 className="db-title">Dashboard</h1>
                <p className="db-subtitle">Welcome back. Here's your store overview.</p>
              </div>

              {/* Business Metrics */}
              <div className="db-metrics">
                <div className="db-metric">
                  <div className="db-metric-label">Total Sales</div>
                  <div className="db-metric-value">{orders.length}</div>
                  <div className="db-metric-sub">orders</div>
                </div>
                <div className="db-metric db-metric-green">
                  <div className="db-metric-label">Total Income</div>
                  <div className="db-metric-value">&#8377;{totalSales.toLocaleString("en-IN")}</div>
                  <div className="db-metric-sub">from all orders</div>
                </div>
                <div className="db-metric db-metric-amber">
                  <div className="db-metric-label">Pending Orders</div>
                  <div className="db-metric-value">{pendingOrders}</div>
                  <div className="db-metric-sub">needs attention</div>
                </div>
                <div className="db-metric db-metric-blue">
                  <div className="db-metric-label">Packed Orders</div>
                  <div className="db-metric-value">{orders.filter((o) => o.status === "Packed").length}</div>
                  <div className="db-metric-sub">ready to ship</div>
                </div>
                <div className="db-metric db-metric-purple">
                  <div className="db-metric-label">Shipped Orders</div>
                  <div className="db-metric-value">{orders.filter((o) => o.status === "Shipped").length}</div>
                  <div className="db-metric-sub">in transit</div>
                </div>
                <div className="db-metric db-metric-teal">
                  <div className="db-metric-label">Delivered Orders</div>
                  <div className="db-metric-value">{deliveredOrders}</div>
                  <div className="db-metric-sub">completed</div>
                </div>
                <div className="db-metric">
                  <div className="db-metric-label">Total Products</div>
                  <div className="db-metric-value">{productList.length}</div>
                  <div className="db-metric-sub">in catalogue</div>
                </div>
              </div>

              {/* Orders Overview */}
              <div className="db-section">
                <h2 className="db-section-title">Orders Overview</h2>
                <div className="db-order-overview">
                  <div className="db-order-status">
                    <span className="db-order-dot db-dot-amber"></span>
                    <span className="db-order-status-label">Pending</span>
                    <span className="db-order-count">{orders.filter((o) => o.status === "Pending").length}</span>
                  </div>
                  <div className="db-order-status">
                    <span className="db-order-dot db-dot-blue"></span>
                    <span className="db-order-status-label">Packed</span>
                    <span className="db-order-count">{orders.filter((o) => o.status === "Packed").length}</span>
                  </div>
                  <div className="db-order-status">
                    <span className="db-order-dot db-dot-purple"></span>
                    <span className="db-order-status-label">Shipped</span>
                    <span className="db-order-count">{orders.filter((o) => o.status === "Shipped").length}</span>
                  </div>
                  <div className="db-order-status">
                    <span className="db-order-dot db-dot-green"></span>
                    <span className="db-order-status-label">Delivered</span>
                    <span className="db-order-count">{deliveredOrders}</span>
                  </div>
                </div>
              </div>

              {/* Recent Orders */}
              <div className="db-section">
                <h2 className="db-section-title">Recent Orders</h2>
                {orders.length > 0 ? (
                  <div className="db-table-wrap">
                    <table className="db-table">
                      <thead>
                        <tr>
                          <th>Order ID</th>
                          <th>Customer</th>
                          <th>Date</th>
                          <th>Amount</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.slice(0, 8).map((order) => (
                          <tr key={order.id}>
                            <td className="db-tbl-mono">{order.orderId}</td>
                            <td>{order.customerName}</td>
                            <td className="db-tbl-muted">{order.date}</td>
                            <td className="db-tbl-amount">&#8377;{(order.total || 0).toLocaleString("en-IN")}</td>
                            <td>
                              <span className={`db-status-badge db-status-${(order.status || "pending").toLowerCase()}`}>
                                {order.status || "Pending"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="db-empty-msg">No orders yet.</div>
                )}
              </div>

              {/* Products Summary */}
              <div className="db-section">
                <h2 className="db-section-title">Products Summary</h2>
                <div className="db-product-summary">
                  <div className="db-ps-item">
                    <span className="db-ps-label">Total Products</span>
                    <span className="db-ps-value">{productList.length}</span>
                  </div>
                  <div className="db-ps-item">
                    <span className="db-ps-label">Jewellery</span>
                    <span className="db-ps-value">{jewelleryCount}</span>
                  </div>
                  <div className="db-ps-item">
                    <span className="db-ps-label">Fashion</span>
                    <span className="db-ps-value">{fashionCount}</span>
                  </div>
                  <div className="db-ps-item db-ps-warn">
                    <span className="db-ps-label">Low Stock</span>
                    <span className="db-ps-value">{lowStockProducts}</span>
                  </div>
                  {outOfStockCount > 0 && (
                    <div className="db-ps-item db-ps-danger">
                      <span className="db-ps-label">Out of Stock</span>
                      <span className="db-ps-value">{outOfStockCount}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Modals */}
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
            </>
          )}

          {/* ---- PRODUCTS ---- */}
          {section === "products" && (
            <>
              <div className="admin-toolbar">
                <div className="admin-toolbar-left">
                  <div className="admin-search-wrapper">
                    <span className="admin-search-icon">&#128269;</span>
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="admin-search-input"
                    />
                  </div>
                  <div className="admin-filter-group">
                    <button
                      onClick={() => { setCategory("all"); setCurrentPage(1); }}
                      className={`admin-filter-btn${category === "all" ? " active" : ""}`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => { setCategory("jewellery"); setCurrentPage(1); }}
                      className={`admin-filter-btn${category === "jewellery" ? " active" : ""}`}
                    >
                      Jewellery
                    </button>
                    <button
                      onClick={() => { setCategory("fashion"); setCurrentPage(1); }}
                      className={`admin-filter-btn${category === "fashion" ? " active" : ""}`}
                    >
                      Fashion
                    </button>
                  </div>
                  <div className="admin-filter-group">
                    <button
                      onClick={() => { setStockFilter("all"); setCurrentPage(1); }}
                      className={`admin-filter-btn${stockFilter === "all" ? " active" : ""}`}
                    >
                      All Stock
                    </button>
                    <button
                      onClick={() => { setStockFilter("in"); setCurrentPage(1); }}
                      className={`admin-filter-btn${stockFilter === "in" ? " active-blue" : ""}`}
                    >
                      In Stock
                    </button>
                    <button
                      onClick={() => { setStockFilter("low"); setCurrentPage(1); }}
                      className={`admin-filter-btn${stockFilter === "low" ? " active-amber" : ""}`}
                    >
                      Low
                    </button>
                    <button
                      onClick={() => { setStockFilter("out"); setCurrentPage(1); }}
                      className={`admin-filter-btn${stockFilter === "out" ? " active-red" : ""}`}
                    >
                      Out
                    </button>
                  </div>
                </div>
                <div className="admin-toolbar-right">
                  <button
                    className="admin-add-btn"
                    onClick={() => setShowAddProduct(true)}
                  >
                    + Add Product
                  </button>
                </div>
              </div>

              {/* Result count & bulk actions */}
              <div className="admin-result-count">
                <span>
                  {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""} found
                </span>
                {selectedIds.length > 0 && (
                  <div className="admin-bulk-actions">
                    <span className="admin-selected-count">
                      {selectedIds.length} selected
                    </span>
                    <button
                      className="admin-bulk-delete-btn"
                      onClick={() => setBulkDeleteTarget(true)}
                    >
                      Delete Selected
                    </button>
                  </div>
                )}
              </div>

              {/* Modals */}
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

              {/* Delete confirmation modal */}
              {deleteTarget && (
                <div
                  className="admin-delete-modal-overlay"
                  onClick={() => setDeleteTarget(null)}
                >
                  <div
                    className="admin-delete-modal"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="admin-delete-modal-icon">&#9888;</div>
                    <h3>Delete Product</h3>
                    <p>
                      Are you sure you want to delete <strong>&ldquo;{deleteTarget.name}&rdquo;</strong>?
                      This action cannot be undone.
                    </p>
                    <div className="admin-delete-modal-actions">
                      <button
                        className="cancel-btn"
                        onClick={() => setDeleteTarget(null)}
                      >
                        Cancel
                      </button>
                      <button
                        className="confirm-delete-btn"
                        onClick={handleDelete}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Bulk delete confirmation */}
              {bulkDeleteTarget && (
                <div
                  className="admin-delete-modal-overlay"
                  onClick={() => setBulkDeleteTarget(false)}
                >
                  <div
                    className="admin-delete-modal"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="admin-delete-modal-icon">&#9888;</div>
                    <h3>Delete {selectedIds.length} Product(s)</h3>
                    <p>
                      Are you sure you want to delete <strong>{selectedIds.length} selected product(s)</strong>?
                      This action cannot be undone.
                    </p>
                    <div className="admin-delete-modal-actions">
                      <button
                        className="cancel-btn"
                        onClick={() => setBulkDeleteTarget(false)}
                      >
                        Cancel
                      </button>
                      <button
                        className="confirm-delete-btn"
                        onClick={handleBulkDelete}
                      >
                        Delete All
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Table */}
              {loading ? (
                <div className="admin-table-wrapper">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="admin-skeleton-row">
                      <div className="admin-skeleton skel-checkbox" />
                      <div className="admin-skeleton skel-img" />
                      <div className="admin-skeleton skel-text w-40" />
                      <div className="admin-skeleton skel-text w-20" />
                      <div className="admin-skeleton skel-text w-12" />
                      <div className="admin-skeleton skel-text w-16" />
                      <div className="admin-skeleton skel-text w-24" />
                    </div>
                  ))}
                </div>
              ) : filteredProducts.length > 0 ? (
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th className="col-checkbox">
                          <input
                            type="checkbox"
                            checked={
                              paginatedProducts.length > 0 &&
                              paginatedProducts.every((p) =>
                                selectedIds.includes(p.id)
                              )
                            }
                            onChange={toggleSelectAll}
                            aria-label="Select all"
                          />
                        </th>
                        <th>Product</th>
                        <th
                          className="sortable"
                          onClick={() => toggleSort("category")}
                        >
                          Category {renderSortArrow("category")}
                        </th>
                        <th
                          className="sortable"
                          onClick={() => toggleSort("price")}
                        >
                          Price {renderSortArrow("price")}
                        </th>
                        <th
                          className="sortable"
                          onClick={() => toggleSort("stock")}
                        >
                          Stock {renderSortArrow("stock")}
                        </th>
                        <th>Discount</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedProducts.map((product) => {
                        const stockNum = Number(product.stock);
                        const stockBadge = getStockBadgeClass(stockNum);

                        return (
                          <tr
                            key={product.id}
                            className={selectedIds.includes(product.id) ? "selected" : ""}
                          >
                            <td className="col-checkbox">
                              <input
                                type="checkbox"
                                checked={selectedIds.includes(product.id)}
                                onChange={() => toggleSelect(product.id)}
                                aria-label={`Select ${product.name}`}
                              />
                            </td>
                            <td className="col-image">
                              {product.image ? (
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  className="admin-product-img"
                                />
                              ) : (
                                <div className="admin-product-img-placeholder">
                                  N/A
                                </div>
                              )}
                            </td>
                            <td className="admin-product-name-cell">
                              <div className="admin-product-name">{product.name}</div>
                              {product.discount > 0 && (
                                <div className="admin-product-name-sub">
                                  {product.discount}% off
                                </div>
                              )}
                            </td>
                            <td>
                              <span
                                className={`admin-category-badge ${
                                  (product.category || "").toLowerCase()
                                }`}
                              >
                                {product.category}
                              </span>
                            </td>
                            <td>
                              <div className="admin-product-price">
                                &#8377;{product.price}
                                {product.originalPrice > product.price && (
                                  <span className="original-price">
                                    &#8377;{product.originalPrice}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td>
                              <span className={`admin-stock-badge ${stockBadge}`}>
                                {getStockLabel(stockNum)}
                              </span>
                            </td>
                            <td>
                              {product.discount > 0 ? (
                                <span className="admin-discount-badge">
                                  {product.discount}% off
                                </span>
                              ) : (
                                <span style={{ color: "var(--admin-text-subtle)", fontSize: 12 }}>&mdash;</span>
                              )}
                            </td>
                            <td>
                              <div className="admin-product-actions">
                                <button
                                  className="admin-action-btn edit"
                                  onClick={() => {
                                    setSelectedProduct(product);
                                    setShowEditProduct(true);
                                  }}
                                >
                                  Edit
                                </button>
                                <button
                                  className="admin-action-btn delete"
                                  onClick={() => setDeleteTarget(product)}
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="admin-pagination">
                      <div className="admin-pagination-info">
                        Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}
                        &ndash;
                        {Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length)} of {filteredProducts.length}
                      </div>
                      <div className="admin-pagination-controls">
                        <button
                          className="admin-pagination-btn"
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage((p) => p - 1)}
                        >
                          Prev
                        </button>
                        {pageNumbers.map((num) => (
                          <button
                            key={num}
                            className={`admin-pagination-btn${num === currentPage ? " active" : ""}`}
                            onClick={() => setCurrentPage(num)}
                          >
                            {num}
                          </button>
                        ))}
                        <button
                          className="admin-pagination-btn"
                          disabled={currentPage === totalPages}
                          onClick={() => setCurrentPage((p) => p + 1)}
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="admin-empty">
                  <div className="admin-empty-icon">&#128269;</div>
                  <h3>No products found</h3>
                  <p>Try a different search or add a new product.</p>
                  <button
                    className="admin-empty-action"
                    onClick={() => setShowAddProduct(true)}
                  >
                    + Add Product
                  </button>
                </div>
              )}
            </>
          )}

          {/* ---- ORDERS ---- */}
          {section === "orders" && (
            <>
              {orders.length === 0 ? (
                <div className="admin-empty">
                  <div className="admin-empty-icon">&#128230;</div>
                  <h3>No Orders Yet</h3>
                  <p>Orders will appear here once customers start purchasing.</p>
                </div>
              ) : (
                <div className="admin-order-grid">
                  {orders
                    .filter((order) => order.status !== "Delivered")
                    .slice()
                    .reverse()
                    .map((order, index) => (
                      <div key={index} className="admin-order-card">
                        <div className="admin-order-id">
                          {order.orderId}
                          <span
                            className={`admin-order-status ${
                              (order.status || "").toLowerCase()
                            }`}
                          >
                            {order.status}
                          </span>
                        </div>

                        <p className="admin-order-meta">
                          {order.customerName} &middot; {order.phone}
                        </p>
                        <p className="admin-order-meta">{order.date}</p>

                        <hr className="admin-order-divider" />

                        <p className="admin-order-meta">
                          {order.house}, {order.street}
                          <br />
                          {order.city}, {order.district}
                          <br />
                          {order.stateName} - {order.pincode}
                        </p>

                        <hr className="admin-order-divider" />

                        {order.items.map((item, i) => (
                          <p key={i} className="admin-order-products">
                            {item.name} x {item.quantity || 1}
                          </p>
                        ))}

                        <hr className="admin-order-divider" />

                        <div className="admin-order-total">
                          &#8377;{order.total}
                        </div>

                        <hr className="admin-order-divider" />

                        <input
                          type="text"
                          placeholder="Tracking ID"
                          defaultValue={order.trackingId || ""}
                          onBlur={(e) =>
                            updateTrackingNumber(order.orderId, e.target.value)
                          }
                          className="admin-order-tracking-input"
                        />
                        <input
                          type="text"
                          placeholder="Tracking Link"
                          defaultValue={order.trackingLink || ""}
                          onBlur={(e) =>
                            updateTrackingLink(order.orderId, e.target.value)
                          }
                          className="admin-order-tracking-input"
                        />
                        <p className="admin-order-tracking-link">
                          {order.trackingId || "No Tracking Number"}
                        </p>

                        <div className="admin-order-actions">
                          <button
                            className="admin-order-btn packed"
                            onClick={() => updateStatus(order.id, "Packed")}
                          >
                            Packed
                          </button>
                          <button
                            className="admin-order-btn shipped"
                            onClick={() => updateStatus(order.id, "Shipped")}
                          >
                            Shipped
                          </button>
                          <button
                            className="admin-order-btn delivered"
                            onClick={() => updateStatus(order.id, "Delivered")}
                          >
                            Delivered
                          </button>
                          <button
                            className="admin-order-btn print"
                            onClick={() => {
                              localStorage.setItem(
                                "printOrder",
                                JSON.stringify(order)
                              );
                              window.open("/shipping-label", "_blank");
                            }}
                          >
                            Print Shipping Label
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </>
          )}

          {/* ---- DELIVERED ---- */}
          {section === "delivered" && (
            <>
              {orders.filter((o) => o.status === "Delivered").length === 0 ? (
                <div className="admin-empty">
                  <div className="admin-empty-icon">&#10003;</div>
                  <h3>No Delivered Orders</h3>
                  <p>Completed orders will appear here.</p>
                </div>
              ) : (
                <div className="admin-order-grid">
                  {orders
                    .filter((order) => order.status === "Delivered")
                    .map((order, index) => (
                      <div key={index} className="admin-order-card">
                        <div className="admin-order-id" style={{ color: "#22c55e" }}>
                          {order.orderId}
                        </div>

                        <p className="admin-order-meta">
                          {order.customerName} &middot; {order.phone}
                        </p>
                        <div className="admin-order-total">
                          &#8377;{order.total}
                        </div>

                        <div className="admin-order-actions">
                          <button
                            className="admin-order-btn shipped"
                            onClick={() => updateStatus(order.id, "Shipped")}
                          >
                            Undo
                          </button>
                          <button
                            className="admin-order-btn"
                            style={{ background: "#ef4444" }}
                            onClick={() => deleteOrder(order.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </>
          )}

          {/* ---- COUPONS ---- */}
          {section === "coupons" && (
            <>
              <div style={{ maxWidth: 500 }}>
                <div className="admin-form-group">
                  <label>Coupon Code</label>
                  <input
                    type="text"
                    placeholder="e.g. SUMMER20"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="admin-form-input"
                  />
                </div>
                <div className="admin-form-group">
                  <label>Discount %</label>
                  <input
                    type="number"
                    placeholder="e.g. 20"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    className="admin-form-input"
                  />
                </div>
                <div className="admin-form-group">
                  <label>Type</label>
                  <select
                    value={couponType}
                    onChange={(e) => setCouponType(e.target.value)}
                    className="admin-form-input"
                  >
                    <option>Percentage</option>
                    <option>Flat Discount</option>
                    <option>Free Delivery</option>
                    <option>Percentage + Free Delivery</option>
                    <option>Flat + Free Delivery</option>
                  </select>
                </div>
                <div className="admin-form-group">
                  <label>Expiry Date</label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="admin-form-input"
                  />
                </div>
                <div className="admin-form-group">
                  <label>Minimum Order (Optional)</label>
                  <input
                    type="number"
                    placeholder="e.g. 500"
                    value={minimumOrder}
                    onChange={(e) => setMinimumOrder(e.target.value)}
                    className="admin-form-input"
                  />
                </div>
                <button
                  className="admin-save-btn"
                  onClick={() => {
                    if (!couponCode || !discount) {
                      toast.error("Please fill in coupon code and discount");
                      return;
                    }
                    const coupons =
                      JSON.parse(localStorage.getItem("coupons")) || [];
                    coupons.push({
                      code: couponCode,
                      discount: Number(discount),
                      type: couponType,
                      minimumOrder: Number(minimumOrder),
                      expiry: expiryDate,
                    });
                    localStorage.setItem("coupons", JSON.stringify(coupons));
                    toast.success("Coupon created");
                    setCouponCode("");
                    setDiscount("");
                    setExpiryDate("");
                    setMinimumOrder("");
                    setCouponRefresh((c) => c + 1);
                  }}
                >
                  Create Coupon
                </button>
              </div>

              <h3
                style={{
                  marginTop: 32,
                  color: "var(--admin-text-muted)",
                  fontSize: 13,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Existing Coupons
              </h3>

              <div className="admin-coupon-list">
                {(
                  JSON.parse(localStorage.getItem("coupons")) || []
                ).map((coupon, index) => (
                  <div key={index} className="admin-coupon-card">
                    <div className="admin-coupon-info">
                      <h4>{coupon.code}</h4>
                      <p>
                        {coupon.discount}% off &middot; {coupon.type} &middot; Min: &#8377;{coupon.minimumOrder || 0}
                      </p>
                    </div>
                    <button
                      className="admin-coupon-delete"
                      onClick={() => {
                        const coupons =
                          JSON.parse(localStorage.getItem("coupons")) || [];
                        const updatedCoupons = coupons.filter(
                          (_, i) => i !== index
                        );
                        localStorage.setItem(
                          "coupons",
                          JSON.stringify(updatedCoupons)
                        );
                        setCouponRefresh((c) => c + 1);
                        toast.success("Coupon deleted");
                      }}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ---- SETTINGS ---- */}
          {section === "settings" && (
            <>
              <div className="admin-settings-layout">
                <div className="admin-settings-nav">
                  <button
                    className={settingSection === "store" ? "active" : ""}
                    onClick={() => setSettingSection("store")}
                  >
                    Store Info
                  </button>
                  <button
                    className={settingSection === "security" ? "active" : ""}
                    onClick={() => setSettingSection("security")}
                  >
                    Security
                  </button>
                </div>

                <div className="admin-settings-panel">
                  {settingSection === "store" && (
                    <>
                      <h2>Store Information</h2>
                      <div className="admin-form-group">
                        <label>Store Name</label>
                        <input
                          type="text"
                          placeholder="Store Name"
                          value={storeSettings.storeName}
                          onChange={(e) =>
                            setStoreSettings({
                              ...storeSettings,
                              storeName: e.target.value,
                            })
                          }
                          className="admin-form-input"
                        />
                      </div>
                      <div className="admin-form-group">
                        <label>Owner Name</label>
                        <input
                          type="text"
                          placeholder="Owner Name"
                          value={storeSettings.ownerName}
                          onChange={(e) =>
                            setStoreSettings({
                              ...storeSettings,
                              ownerName: e.target.value,
                            })
                          }
                          className="admin-form-input"
                        />
                      </div>
                      <div className="admin-form-group">
                        <label>Mobile Number</label>
                        <input
                          type="text"
                          placeholder="Mobile"
                          value={storeSettings.mobile}
                          onChange={(e) =>
                            setStoreSettings({
                              ...storeSettings,
                              mobile: e.target.value,
                            })
                          }
                          className="admin-form-input"
                        />
                      </div>
                      <div className="admin-form-group">
                        <label>WhatsApp Number</label>
                        <input
                          type="text"
                          placeholder="WhatsApp"
                          value={storeSettings.whatsapp}
                          onChange={(e) =>
                            setStoreSettings({
                              ...storeSettings,
                              whatsapp: e.target.value,
                            })
                          }
                          className="admin-form-input"
                        />
                      </div>
                      <div className="admin-form-group">
                        <label>Email</label>
                        <input
                          type="email"
                          placeholder="Email"
                          value={storeSettings.email}
                          onChange={(e) =>
                            setStoreSettings({
                              ...storeSettings,
                              email: e.target.value,
                            })
                          }
                          className="admin-form-input"
                        />
                      </div>
                      <div className="admin-form-group">
                        <label>Store Address</label>
                        <textarea
                          placeholder="Store Address"
                          rows={4}
                          value={storeSettings.address}
                          onChange={(e) =>
                            setStoreSettings({
                              ...storeSettings,
                              address: e.target.value,
                            })
                          }
                          className="admin-form-input"
                        />
                      </div>
                      <div className="admin-form-group">
                        <label>Google Maps Link</label>
                        <input
                          type="text"
                          placeholder="Maps URL"
                          value={storeSettings.maps}
                          onChange={(e) =>
                            setStoreSettings({
                              ...storeSettings,
                              maps: e.target.value,
                            })
                          }
                          className="admin-form-input"
                        />
                      </div>
                      <div className="admin-form-group">
                        <label>Instagram Link</label>
                        <input
                          type="text"
                          placeholder="Instagram URL"
                          value={storeSettings.instagram}
                          onChange={(e) =>
                            setStoreSettings({
                              ...storeSettings,
                              instagram: e.target.value,
                            })
                          }
                          className="admin-form-input"
                        />
                      </div>
                      <button
                        className="admin-save-btn"
                        onClick={saveStoreSettings}
                      >
                        Save Store Settings
                      </button>
                    </>
                  )}

                  {settingSection === "security" && (
                    <>
                      <h2>Security</h2>
                      <div className="admin-form-group">
                        <label>Current Password</label>
                        <input
                          type="password"
                          placeholder="Enter current password"
                          value={currentPassword}
                          onChange={(e) =>
                            setCurrentPassword(e.target.value)
                          }
                          className="admin-form-input"
                        />
                      </div>
                      <div className="admin-form-group">
                        <label>New Password</label>
                        <input
                          type="password"
                          placeholder="Enter new password"
                          value={newPassword}
                          onChange={(e) =>
                            setNewPassword(e.target.value)
                          }
                          className="admin-form-input"
                        />
                      </div>
                      <div className="admin-form-group">
                        <label>Confirm Password</label>
                        <input
                          type="password"
                          placeholder="Confirm new password"
                          value={confirmPassword}
                          onChange={(e) =>
                            setConfirmPassword(e.target.value)
                          }
                          className="admin-form-input"
                        />
                      </div>
                      <div className="admin-form-group">
                        <label>Security Question</label>
                        <select
                          value={securityQuestion}
                          onChange={(e) =>
                            setSecurityQuestion(e.target.value)
                          }
                          className="admin-form-input"
                        >
                          <option value="">Select a Question</option>
                          <option>What is your favourite color?</option>
                          <option>What is your birth village?</option>
                          <option>What is your favourite food?</option>
                          <option>What is your favourite place?</option>
                          <option>What is your lucky number?</option>
                        </select>
                      </div>
                      <div className="admin-form-group">
                        <label>Answer</label>
                        <input
                          type="text"
                          placeholder="Enter your Answer"
                          value={securityAnswer}
                          onChange={(e) =>
                            setSecurityAnswer(e.target.value)
                          }
                          className="admin-form-input"
                        />
                      </div>
                      <button
                        className="admin-save-btn"
                        onClick={saveSecuritySettings}
                      >
                        Save Security Settings
                      </button>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Admin;
