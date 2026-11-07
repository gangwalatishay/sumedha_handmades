import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { API_BASE } from "../utils/api";
import { useToast } from "../context/ToastContext";
import "../styles/adminPayments.css";

const money = (value) => `₹${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
const date = (value) => value ? new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "—";

const AdminPayments = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const [filter, setFilter] = useState(() => {
    const requested = searchParams.get("filter");
    return ["Paid", "Failed", "Refund Failed", "Needs attention"].includes(requested) ? requested : "All payments";
  });
  const [query, setQuery] = useState("");
  const token = localStorage.getItem("token") || "";

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE}/api/payment/admin`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) navigate("/admin-login", { replace: true });
        throw new Error(data.message || "Could not load payment records");
      }
      setPayments(data.payments || []);
    } catch (err) {
      setError(err.message || "Could not load payment records");
    } finally {
      setLoading(false);
    }
  }, [navigate, token]);

  useEffect(() => { refresh(); }, [refresh]);

  const refund = async (order) => {
    if (!window.confirm(`Refund ${money(order.totalAmount)} for order #${order._id.slice(-6)}? The order will be cancelled.`)) return;
    setBusyId(order._id);
    setError("");
    try {
      const response = await fetch(`${API_BASE}/api/payment/admin/${order._id}/refund`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || "Refund could not be started");
      toast.success(data.message || "Refund request submitted. Payment status will update when Razorpay confirms it.");
      await refresh();
    } catch (err) {
      setError(err.message || "Refund could not be started");
    } finally {
      setBusyId("");
    }
  };

  const filtered = useMemo(() => payments.filter((payment) => {
    const matchesStatus = filter === "All payments"
      || (filter === "Needs attention" ? ["Failed", "Refund Failed"].includes(payment.paymentStatus) : payment.paymentStatus === filter);
    const text = `${payment._id} ${payment.customerId?.name || ""} ${payment.customerId?.email || ""} ${payment.razorpayPaymentId || ""}`.toLowerCase();
    return matchesStatus && text.includes(query.trim().toLowerCase());
  }), [payments, filter, query]);

  const totals = useMemo(() => payments.reduce((result, payment) => {
    result[payment.paymentStatus] = (result[payment.paymentStatus] || 0) + 1;
    return result;
  }, {}), [payments]);

  return (
    <main className="admin-payments-page">
      <header className="admin-payments-header"><div><span>PAYMENT RECONCILIATION</span><h1>Payments</h1><p>Every checkout attempt, its verified payment state, and refund actions.</p></div><button onClick={refresh} disabled={loading}>↻ Refresh</button></header>
      <section className="payment-summary" aria-label="Payment status totals">
        {["Paid", "Pending", "Failed", "Refund Pending", "Refunded"].map((status) => <article key={status}><span>{status}</span><strong>{totals[status] || 0}</strong></article>)}
      </section>
      <section className="payment-toolbar">
        <label><span className="sr-only">Search payment records</span><input type="search" placeholder="Search order, customer or payment ID" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
        <label><span className="sr-only">Filter payment status</span><select value={filter} onChange={(event) => setFilter(event.target.value)}><option>All payments</option><option>Needs attention</option>{["Paid", "Pending", "Failed", "Refund Pending", "Refunded", "Refund Failed"].map((status) => <option key={status}>{status}</option>)}</select></label>
        <span>{filtered.length} records</span>
      </section>
      {error && <p className="payment-error" role="alert">{error}</p>}
      {loading ? <p className="payment-empty">Loading payment records…</p> : filtered.length === 0 ? <p className="payment-empty">No matching payment records.</p> : (
        <div className="payment-table-wrap"><table className="payment-table"><thead><tr><th>Order</th><th>Customer</th><th>Created</th><th>Amount</th><th>Payment state</th><th>Order state</th><th>Payment reference</th><th>Action</th></tr></thead><tbody>
          {filtered.map((payment) => <tr key={payment._id}>
            <td><strong>#{payment._id.slice(-6).toUpperCase()}</strong></td>
            <td><strong>{payment.customerId?.name || "Customer"}</strong><small>{payment.customerId?.email || ""}</small></td>
            <td>{date(payment.createdAt)}</td><td>{money(payment.totalAmount)}</td>
            <td><span className={`payment-pill payment-${payment.paymentStatus.toLowerCase().replace(/ /g, "-")}`}>{payment.paymentStatus}</span>{payment.paymentFailureReason && <small className="payment-failure-reason">{payment.paymentFailureReason}</small>}</td>
            <td>{payment.status}</td><td><small>Payment: {payment.razorpayPaymentId || "—"}</small><small>Order: {payment.razorpayOrderId || "—"}</small></td>
            <td>{payment.paymentStatus === "Refund Failed" || (payment.paymentStatus === "Paid" && ["Placed", "Processing"].includes(payment.status)) ? <button className="refund-button" disabled={busyId === payment._id} onClick={() => refund(payment)}>{busyId === payment._id ? "Working…" : payment.paymentStatus === "Refund Failed" ? "Retry refund" : "Refund"}</button> : "—"}</td>
          </tr>)}
        </tbody></table></div>
      )}
    </main>
  );
};

export default AdminPayments;
