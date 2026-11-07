import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../utils/api";
import { useToast } from "../context/ToastContext";
import "../styles/adminInvoices.css";

const PAGE_SIZE = 10;
const statuses = ["Placed", "Processing", "Shipped", "Out for Delivery", "Delivered"];
const money = (amount = 0) => `₹${Number(amount || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
const date = (value) => value ? new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

export default function AdminInvoiceDashboard() {
  const navigate = useNavigate();
  const toast = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busyAction, setBusyAction] = useState("");
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All statuses");
  const [page, setPage] = useState(1);
  const [fromDraft, setFromDraft] = useState("");
  const [toDraft, setToDraft] = useState("");
  const [range, setRange] = useState({ from: "", to: "" });
  const token = localStorage.getItem("token") || "";

  const loadInvoices = useCallback(async () => {
    setLoading(true);
    setError("");
    const params = new URLSearchParams();
    if (range.from) params.set("from", range.from);
    if (range.to) params.set("to", range.to);
    try {
      const query = params.toString();
      const response = await fetch(`${API_BASE}/api/admin/analytics/invoices${query ? `?${query}` : ""}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) navigate("/admin-login", { replace: true });
        throw new Error(result.message || "Could not load invoices");
      }
      setData(result);
    } catch (requestError) {
      setError(requestError.message || "Could not load invoices");
    } finally {
      setLoading(false);
    }
  }, [navigate, range, token]);

  useEffect(() => { loadInvoices(); }, [loadInvoices]);
  useEffect(() => { setPage(1); }, [search, status, range]);

  const filteredInvoices = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return (data?.invoices || []).filter((invoice) => {
      const matchesStatus = status === "All statuses" || invoice.status === status;
      const id = `inv-${String(invoice._id || "").slice(-6)}`;
      const text = `${id} ${invoice._id || ""} ${invoice.customerId?.name || ""} ${invoice.customerId?.email || ""}`.toLowerCase();
      return matchesStatus && (!needle || text.includes(needle));
    });
  }, [data, search, status]);

  const pageCount = Math.max(1, Math.ceil(filteredInvoices.length / PAGE_SIZE));
  const visibleInvoices = filteredInvoices.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const summary = data?.summary || {};

  const download = async (path, filename, action) => {
    setBusyAction(action);
    try {
      const response = await fetch(`${API_BASE}${path}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.message || "Download could not be prepared");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      toast.success("Download started.");
    } catch (downloadError) {
      toast.error(downloadError.message || "Download failed. Please try again.");
    } finally {
      setBusyAction("");
    }
  };

  const rangeParams = () => {
    const params = new URLSearchParams();
    if (range.from) params.set("from", range.from);
    if (range.to) params.set("to", range.to);
    if (status !== "All statuses") params.set("status", status);
    return params.toString();
  };

  const applyDateRange = (event) => {
    event.preventDefault();
    if (fromDraft && toDraft && fromDraft > toDraft) {
      setError("The start date must be before the end date.");
      return;
    }
    setRange({ from: fromDraft, to: toDraft });
  };

  return (
    <main className="admin-invoices-page">
      <header className="admin-invoices-header">
        <div><span>FINANCE & RECORDS</span><h1>Invoices</h1><p>Review paid order invoices, export records, or download customer-ready PDFs.</p></div>
        <div className="invoice-header-actions">
          <button type="button" onClick={() => loadInvoices()} disabled={loading}>{loading ? "Refreshing…" : "↻ Refresh"}</button>
          <button type="button" className="invoice-export-button" disabled={busyAction === "csv"} onClick={() => download(`/api/admin/analytics/invoices/export/csv${rangeParams() ? `?${rangeParams()}` : ""}`, "sumedha-invoices.csv", "csv")}>{busyAction === "csv" ? "Preparing CSV…" : "Export CSV"}</button>
          <button type="button" className="invoice-zip-button" disabled={busyAction === "zip"} onClick={() => download(`/api/orders/admin/invoices/zip${rangeParams() ? `?${rangeParams()}` : ""}`, "sumedha-invoices.zip", "zip")}>{busyAction === "zip" ? "Preparing ZIP…" : "Download PDFs"}</button>
        </div>
      </header>

      {error && <div className="invoice-feedback invoice-error" role="alert"><span>{error}</span><button type="button" onClick={loadInvoices}>Try again</button></div>}

      <section className="invoice-summary-grid" aria-label="Invoice totals">
        <article><span>Invoices in range</span><strong>{summary.totalInvoices ?? "—"}</strong><small>Cancelled and unpaid orders excluded</small></article>
        <article><span>Invoice value</span><strong>{summary.totalRevenue == null ? "—" : money(summary.totalRevenue)}</strong><small>Recorded order totals</small></article>
        <article><span>Paid invoices</span><strong>{summary.paidInvoices ?? "—"}</strong><small>Payment verified or recorded</small></article>
        <article><span>Average invoice</span><strong>{summary.averageInvoiceValue == null ? "—" : money(summary.averageInvoiceValue)}</strong><small>For selected date range</small></article>
      </section>

      <section className="invoice-tools" aria-label="Invoice filters and exports">
        <form className="invoice-date-filter" onSubmit={applyDateRange}>
          <label>From<input type="date" value={fromDraft} max={toDraft || undefined} onChange={(event) => setFromDraft(event.target.value)} /></label>
          <label>To<input type="date" value={toDraft} min={fromDraft || undefined} max={new Date().toISOString().slice(0, 10)} onChange={(event) => setToDraft(event.target.value)} /></label>
          <button type="submit" disabled={loading}>Apply dates</button>
          {(range.from || range.to) && <button type="button" className="invoice-clear-dates" onClick={() => { setFromDraft(""); setToDraft(""); setRange({ from: "", to: "" }); }}>Clear dates</button>}
        </form>
        <div className="invoice-search-filter">
          <label><span className="sr-only">Search invoices</span><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search invoice, customer or email" /></label>
          <label><span className="sr-only">Filter invoice order status</span><select value={status} onChange={(event) => setStatus(event.target.value)}><option>All statuses</option>{statuses.map((item) => <option key={item}>{item}</option>)}</select></label>
        </div>
      </section>

      {loading && !data ? <div className="invoice-empty" role="status">Loading invoice records…</div> : null}
      {data?.truncated && <p className="invoice-limit-note">Showing the 500 most recent invoices. Use the date filter to narrow the results.</p>}
      {data && !loading && visibleInvoices.length === 0 ? <section className="invoice-empty"><h2>No matching invoices</h2><p>Try another search, status, or date range.</p></section> : null}
      {visibleInvoices.length > 0 && (
        <section className="invoice-table-wrap" aria-label="Invoice records">
          <div className="invoice-table-count">Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredInvoices.length)} of {filteredInvoices.length} loaded invoices</div>
          <div className="invoice-table-scroll"><table className="invoice-table"><thead><tr><th>Invoice</th><th>Date</th><th>Customer</th><th>Payment</th><th>Order status</th><th>Total</th><th>Document</th></tr></thead><tbody>
            {visibleInvoices.map((invoice) => <tr key={invoice._id}>
              <td><strong>INV-{String(invoice._id).slice(-6).toUpperCase()}</strong><small>Order {String(invoice._id).slice(-8).toUpperCase()}</small></td>
              <td>{date(invoice.createdAt)}</td>
              <td><strong>{invoice.customerId?.name || "Customer"}</strong><small>{invoice.customerId?.email || ""}</small></td>
              <td><span className={`invoice-payment-pill ${invoice.paymentStatus === "Paid" ? "is-paid" : "is-recorded"}`}>{invoice.paymentStatus || "Not Recorded"}</span></td>
              <td>{invoice.status}</td>
              <td>{money(invoice.totalAmount)}{invoice.couponCode && <small className="invoice-coupon-note">{invoice.couponCode}: −{money(invoice.couponDiscount)}</small>}</td>
              <td><button type="button" className="invoice-download-row" disabled={busyAction === invoice._id} onClick={() => download(`/api/orders/admin/invoice/${invoice._id}/pdf`, `INV-${String(invoice._id).slice(-6).toUpperCase()}.pdf`, invoice._id)}>{busyAction === invoice._id ? "Preparing…" : "Download PDF"}</button></td>
            </tr>)}
          </tbody></table></div>
          {pageCount > 1 && <nav className="invoice-pagination" aria-label="Invoice pages"><button type="button" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>Previous</button><span>Page {page} of {pageCount}</span><button type="button" disabled={page >= pageCount} onClick={() => setPage((current) => current + 1)}>Next</button></nav>}
        </section>
      )}
    </main>
  );
}
