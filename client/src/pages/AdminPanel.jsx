import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../utils/api";
import { useToast } from "../context/ToastContext";
import "../styles/adminPanel.css";

const shortcuts = [
  { icon: "＋", title: "Add a product", detail: "Create a new handmade listing", path: "/admin" },
  { icon: "▦", title: "Products", detail: "Update prices and stock", path: "/admin/products" },
  { icon: "▤", title: "Orders", detail: "Review and fulfil purchases", path: "/admin/orders" },
  { icon: "▧", title: "Invoices", detail: "View and export invoices", path: "/admin/invoices" },
  { icon: "↗", title: "Analytics", detail: "Understand store performance", path: "/admin/analytics" },
  { icon: "₹", title: "Payments", detail: "Review payment outcomes and refunds", path: "/admin/payments" },
  { icon: "%", title: "Coupons", detail: "Create and manage discount codes", path: "/admin/coupons" },
];

const AdminPanel = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [summary, setSummary] = useState(null);
  const [totals, setTotals] = useState(null);
  const [lowStock, setLowStock] = useState(null);
  const [totalProducts, setTotalProducts] = useState(null);
  const [recentCustomers, setRecentCustomers] = useState(null);
  const [newOrders, setNewOrders] = useState(null);
  const [paymentSummary, setPaymentSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    setSummary(null);
    setTotals(null);
    setLowStock(null);
    setTotalProducts(null);
    setRecentCustomers(null);
    setNewOrders(null);
    setPaymentSummary(null);
    const token = localStorage.getItem("token") || "";
    const headers = { Authorization: `Bearer ${token}` };
    const today = new Date().toISOString().slice(0, 10);
    const start = new Date(Date.now() - 29 * 86400000).toISOString().slice(0, 10);
    try {
      const [analyticsRes, productsRes, newOrdersRes, paymentsRes] = await Promise.all([
        fetch(`${API_BASE}/api/analytics?from=${start}&to=${today}`, { headers }),
        fetch(`${API_BASE}/api/products`),
        fetch(`${API_BASE}/api/orders/has-new`, { headers }),
        fetch(`${API_BASE}/api/payment/admin/summary`, { headers }),
      ]);
      const [analytics, products, notification, paymentCounts] = await Promise.all([
        analyticsRes.json().catch(() => ({})),
        productsRes.json().catch(() => []),
        newOrdersRes.json().catch(() => ({})),
        paymentsRes.json().catch(() => ({})),
      ]);
      if (!analyticsRes.ok) throw new Error(analytics.message || "Could not load dashboard data");
      setSummary(analytics.summary);
      setTotals(analytics.totals || null);
      setRecentCustomers(Array.isArray(analytics.users) ? analytics.users.reduce((sum, row) => sum + Number(row.users || 0), 0) : null);
      setTotalProducts(productsRes.ok && Array.isArray(products) ? products.length : null);
      setLowStock(productsRes.ok && Array.isArray(products) ? products.filter((item) => Number(item.stock) <= 5).length : null);
      setNewOrders(newOrdersRes.ok ? (notification.newCount ?? (notification.hasNew ? 1 : 0)) : null);
      setPaymentSummary(paymentsRes.ok ? paymentCounts : null);
      setError("");
    } catch (err) {
      setError(err.message || "Could not load dashboard data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const openOrders = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/orders/mark-seen`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
      });
      if (!response.ok) throw new Error("Could not mark new orders as reviewed");
      setNewOrders(0);
    } catch (err) {
      toast.error(err.message || "Could not update the new order count");
    }
    navigate("/admin/orders");
  };

  const paymentIssues = paymentSummary
    ? (paymentSummary.Failed?.count || 0) + (paymentSummary["Refund Failed"]?.count || 0)
    : null;

  return (
    <main className="admin-panel">
      <div className="admin-dashboard-inner">
        <header className="admin-dashboard-header">
          <div><span className="admin-eyebrow">SUMEDHA HANDMADES · ADMIN</span><h1>Good to see you.</h1><p>Your store at a glance. Here’s what needs your attention.</p></div>
          <button className="admin-refresh" onClick={refresh} disabled={loading}>{loading ? "Updating…" : "↻ Refresh"}</button>
        </header>

        {error && <p className="admin-dashboard-error" role="alert">{error}</p>}
        <section className="admin-overview" aria-label="Store overview">
          <button type="button" className="admin-overview-card" onClick={() => navigate("/admin/payments?filter=Paid")}>
            <span>Total payments received</span><strong>{totals ? `₹${Number(totals.paidRevenue || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}` : "—"}</strong><small>{summary ? `₹${Number(summary.paidRevenue || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })} in the last 30 days · captured only` : "Captured payments · open payments"}</small>
          </button>
          <button type="button" className="admin-overview-card" onClick={() => navigate("/admin/orders")}>
            <span>Total orders</span><strong>{totals?.totalOrders ?? "—"}</strong><small>{summary ? `${summary.totalOrders} in the last 30 days · ${totals?.activeOrders ?? 0} active overall` : "Open order management"}</small>
          </button>
          <button type="button" className="admin-overview-card" onClick={() => navigate("/admin/analytics")}>
            <span>Total customers</span><strong>{totals?.totalCustomers ?? "—"}</strong><small>{recentCustomers == null ? "Customer registrations · view analytics" : `${recentCustomers} joined in the last 30 days · view analytics`}</small>
          </button>
          <button type="button" className={`admin-overview-card ${lowStock ? "needs-attention" : ""}`} onClick={() => navigate("/admin/products?filter=low-stock")}>
            <span>Total products</span><strong>{totalProducts ?? "—"}</strong><small>{lowStock == null ? "Inventory count unavailable · view products" : `${lowStock} with 5 or fewer in stock · view products`}</small>
          </button>
          <button type="button" className="admin-overview-card" onClick={openOrders}>
            <span>New orders</span><strong>{newOrders ?? "—"}</strong><small>{newOrders == null ? "Order count unavailable · open orders" : newOrders ? "Ready for review · open orders" : "All caught up · open orders"}</small>
          </button>
          <button type="button" className={`admin-overview-card ${paymentIssues ? "needs-attention" : ""}`} onClick={() => navigate("/admin/payments?filter=Needs%20attention")}>
            <span>Payment issues</span><strong>{paymentIssues ?? "—"}</strong><small>{paymentIssues == null ? "Payment count unavailable · review payments" : "Failed payments or refunds · review"}</small>
          </button>
        </section>

        <div className="admin-section-title"><div><h2>Store tools</h2><p>Manage the day-to-day work of your shop.</p></div></div>
        <section className="admin-actions" aria-label="Admin tools">
          {shortcuts.map((item) => <button className="admin-action-card" key={item.path} onClick={() => item.path === "/admin/orders" ? openOrders() : navigate(item.path)}>
            <span className="admin-action-icon" aria-hidden="true">{item.icon}</span><span className="admin-action-copy"><strong>{item.title}</strong><small>{item.detail}</small></span><span className="admin-action-arrow" aria-hidden="true">→</span>
          </button>)}
        </section>
      </div>
    </main>
  );
};

export default AdminPanel;
