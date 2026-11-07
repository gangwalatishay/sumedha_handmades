import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../utils/api";
import { useToast } from "../context/ToastContext";
import "../styles/adminOrders.css";

const statuses = ["Pending Payment", "Placed", "Processing", "Shipped", "Out for Delivery", "Delivered", "Cancelled"];
const nextStatuses = {
  "Pending Payment": [],
  Placed: ["Processing", "Shipped", "Cancelled"],
  Processing: ["Shipped", "Cancelled"],
  Shipped: ["Out for Delivery", "Delivered"],
  "Out for Delivery": ["Delivered"],
  Delivered: [],
  Cancelled: [],
};
const formatMoney = (value) => `₹${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
const formatDate = (value) => value ? new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

const AdminOrders = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All orders");
  const token = localStorage.getItem("token") || "";

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE}/api/admin/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) navigate("/admin-login", { replace: true });
        throw new Error(data.message || "Could not load orders");
      }
      setOrders(data.orders || []);
    } catch (err) {
      setError(err.message || "Could not load orders");
    } finally {
      setLoading(false);
    }
  }, [navigate, token]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const updateStatus = async (orderId, status) => {
    setSavingId(orderId);
    setError("");
    try {
      const response = await fetch(`${API_BASE}/api/admin/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || "Could not update order status");
      setOrders((current) => current.map((order) => order._id === orderId ? { ...order, status } : order));
      toast.success(`Order status updated to ${status}.`);
    } catch (err) {
      setError(err.message || "Could not update order status");
    } finally {
      setSavingId("");
    }
  };

  const filteredOrders = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return orders.filter((order) => {
      const customer = order.customerId || {};
      const matchesQuery = !normalizedQuery || [order._id, customer.name, customer.email]
        .some((value) => String(value || "").toLowerCase().includes(normalizedQuery));
      return matchesQuery && (statusFilter === "All orders" || order.status === statusFilter);
    });
  }, [orders, query, statusFilter]);

  return (
    <main className="admin-orders-page">
      <header className="admin-orders-header">
        <div><span className="admin-orders-eyebrow">FULFILMENT</span><h1>Orders</h1><p>Review customer purchases and keep delivery status up to date.</p></div>
        <button type="button" className="orders-refresh" onClick={fetchOrders} disabled={loading}>↻ Refresh</button>
      </header>

      <section className="orders-toolbar" aria-label="Filter orders">
        <label className="orders-search"><span className="sr-only">Search orders</span><input type="search" placeholder="Search order ID, customer or email" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
        <label className="orders-status-filter"><span className="sr-only">Filter by status</span><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option>All orders</option>{statuses.map((status) => <option key={status}>{status}</option>)}</select></label>
        <span className="orders-result-count">{filteredOrders.length} {filteredOrders.length === 1 ? "order" : "orders"}</span>
      </section>

      {error && <p className="orders-feedback orders-error" role="alert">{error}</p>}
      {loading ? <p className="orders-feedback">Loading orders…</p> : filteredOrders.length === 0 ? <section className="orders-empty"><span>▤</span><h2>{orders.length ? "No matching orders" : "No orders yet"}</h2><p>{orders.length ? "Try changing the search or status filter." : "New customer orders will appear here."}</p></section> : (
        <section className="orders-list" aria-label="Orders">
          {filteredOrders.map((order) => {
            const customer = order.customerId || {};
            const address = order.shippingAddress;
            const itemCount = (order.items || []).reduce((sum, item) => sum + Number(item.qty || 0), 0);
            return <article className="order-card" key={order._id}>
              <div className="order-card-main">
                <div className="order-card-top"><div><span className="order-number">Order #{order._id.slice(-6).toUpperCase()}</span><span className="order-date">{formatDate(order.createdAt)}</span></div><span className={`order-status status-${(order.status || "placed").toLowerCase().replace(/ /g, "-")}`}>{order.status}</span>{order.paymentStatus && order.paymentStatus !== "Not Recorded" && <span className={`order-payment-status payment-${order.paymentStatus.toLowerCase().replace(/ /g, "-")}`}>{order.paymentStatus}</span>}</div>
                <div className="order-customer"><strong>{customer.name || "Customer"}</strong>{customer.email && <span>{customer.email}</span>}</div>
                <div className="order-items-preview">{itemCount} {itemCount === 1 ? "item" : "items"}<span>·</span>{(order.items || []).slice(0, 3).map((item) => item.name).join(", ")}{(order.items || []).length > 3 ? " and more" : ""}</div>
                {address && <div className="order-delivery"><strong>Deliver to {address.fullName}</strong><span>{[address.addressLine1, address.addressLine2, address.city, address.state, address.postalCode].filter(Boolean).join(", ")}</span><span>{address.phone}</span></div>}
              </div>
              <div className="order-card-side"><strong>{formatMoney(order.totalAmount)}</strong>{order.couponCode && <span className="order-coupon-note">{order.couponCode} · {formatMoney(order.couponDiscount)} off</span>}<label>Update status<select value={order.status} disabled={savingId === order._id || order.status === "Pending Payment"} onChange={(event) => updateStatus(order._id, event.target.value)}>{statuses.map((status) => <option key={status} disabled={status !== order.status && (!nextStatuses[order.status]?.includes(status) || (status === "Cancelled" && order.paymentStatus === "Paid"))}>{status}</option>)}</select></label></div>
            </article>;
          })}
        </section>
      )}
    </main>
  );
};

export default AdminOrders;
