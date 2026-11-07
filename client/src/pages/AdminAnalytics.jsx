import { useCallback, useEffect, useState } from "react";
import {
  Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from "recharts";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../utils/api";
import "../styles/adminAnalytics.css";

const money = (amount = 0) => `₹${Number(amount || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
const todayString = () => new Date().toISOString().slice(0, 10);
const dateDaysAgo = (days) => new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);
const dateLabel = (value) => value ? new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : value;

export default function AdminAnalytics() {
  const navigate = useNavigate();
  const today = todayString();
  const [fromDraft, setFromDraft] = useState(() => dateDaysAgo(29));
  const [toDraft, setToDraft] = useState(today);
  const [range, setRange] = useState(() => ({ from: dateDaysAgo(29), to: today }));
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError("");
    const params = new URLSearchParams(range);
    try {
      const response = await fetch(`${API_BASE}/api/analytics?${params}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) navigate("/admin-login", { replace: true });
        throw new Error(result.message || "Could not load analytics");
      }
      setData(result);
    } catch (requestError) {
      setError(requestError.message || "Could not load analytics");
    } finally {
      setLoading(false);
    }
  }, [navigate, range]);

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  const applyDateRange = (event) => {
    event.preventDefault();
    if (!fromDraft || !toDraft || fromDraft > toDraft || toDraft > today) {
      setError("Choose a valid date range that ends today or earlier.");
      return;
    }
    setRange({ from: fromDraft, to: toDraft });
  };

  const choosePeriod = (days) => {
    const nextRange = { from: dateDaysAgo(days - 1), to: today };
    setFromDraft(nextRange.from);
    setToDraft(nextRange.to);
    setRange(nextRange);
  };

  const userCount = (data?.users || []).reduce((sum, row) => sum + Number(row.users || 0), 0);
  const chartData = (data?.orders || []).map((row) => ({ ...row, label: dateLabel(row._id) }));

  return (
    <main className="analytics-page">
      <header className="analytics-header">
        <div>
          <span className="analytics-eyebrow">STORE PERFORMANCE</span>
          <h1>Analytics</h1>
          <p>Track order value, captured payments, customer growth, and top products.</p>
        </div>
        <div className="analytics-controls">
          <div className="analytics-quick-ranges" aria-label="Quick date ranges">
            {[7, 30, 90].map((days) => <button key={days} type="button" className={range.from === dateDaysAgo(days - 1) && range.to === today ? "active" : ""} onClick={() => choosePeriod(days)}>{days} days</button>)}
          </div>
          <form className="analytics-filters" onSubmit={applyDateRange}>
            <label>From<input type="date" value={fromDraft} max={toDraft || today} onChange={(event) => setFromDraft(event.target.value)} required /></label>
            <label>To<input type="date" value={toDraft} min={fromDraft} max={today} onChange={(event) => setToDraft(event.target.value)} required /></label>
            <button type="submit" disabled={loading}>Apply</button>
            <button type="button" className="analytics-refresh" onClick={fetchAnalytics} disabled={loading}>{loading ? "Updating…" : "↻ Refresh"}</button>
          </form>
        </div>
      </header>

      <div className="analytics-period-label">Showing {dateLabel(range.from)} – {dateLabel(range.to)}{loading && data ? " · Updating…" : ""}</div>
      {error && <div className="analytics-message analytics-error" role="alert"><span>{error}</span><button type="button" onClick={fetchAnalytics}>Try again</button></div>}
      {loading && !data ? <div className="analytics-message" role="status">Loading store performance…</div> : null}
      {!loading && !data && !error ? <div className="analytics-message">No analytics data is available for this range.</div> : null}
      {data && <>
        <section className="analytics-stat-grid" aria-label="Store summary">
          <article className="analytics-stat"><span>Order value</span><strong>{money(data.summary?.revenue)}</strong><small>Cancelled orders excluded</small></article>
          <article className="analytics-stat"><span>Payments captured</span><strong>{money(data.summary?.paidRevenue)}</strong><small>Verified payments in this period</small></article>
          <article className="analytics-stat"><span>Orders</span><strong>{data.summary?.totalOrders ?? 0}</strong><small>{data.summary?.activeOrders ?? 0} active</small></article>
          <article className="analytics-stat"><span>Average paid order</span><strong>{money(data.summary?.averageOrderValue)}</strong><small>Captured orders only</small></article>
          <article className="analytics-stat"><span>New customers</span><strong>{userCount}</strong><small>Joined in this period</small></article>
        </section>

        <section className="analytics-chart-grid">
          <article className="analytics-card analytics-chart-card">
            <div className="analytics-card-heading"><div><h2>Order activity</h2><p>Daily order value and order volume</p></div></div>
            {chartData.length ? <div className="analytics-chart"><ResponsiveContainer width="100%" height="100%"><LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
              <CartesianGrid stroke="#eee8e4" strokeDasharray="4 4" /><XAxis dataKey="label" tick={{ fontSize: 11 }} minTickGap={18} /><YAxis yAxisId="value" tickFormatter={(value) => `₹${value}`} tick={{ fontSize: 10 }} width={58} /><YAxis yAxisId="orders" orientation="right" allowDecimals={false} tick={{ fontSize: 10 }} width={32} /><Tooltip labelFormatter={(label) => label} formatter={(value, name) => [name === "Order value" ? money(value) : value, name]} /><Legend /><Line yAxisId="value" type="monotone" dataKey="revenue" name="Order value" stroke="#ec4899" strokeWidth={3} dot={false} /><Line yAxisId="orders" type="monotone" dataKey="orders" name="Orders" stroke="#c02670" strokeWidth={2} dot={false} />
            </LineChart></ResponsiveContainer></div> : <p className="analytics-empty">No orders in this period.</p>}
          </article>
          <article className="analytics-card analytics-chart-card">
            <div className="analytics-card-heading"><div><h2>New customers</h2><p>Customer accounts created by day</p></div></div>
            {data.users?.length ? <div className="analytics-chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={data.users.map((row) => ({ ...row, label: dateLabel(row._id) }))}>
              <CartesianGrid stroke="#eee8e4" strokeDasharray="4 4" /><XAxis dataKey="label" tick={{ fontSize: 11 }} minTickGap={18} /><YAxis allowDecimals={false} tick={{ fontSize: 11 }} /><Tooltip /><Bar dataKey="users" name="Customers" fill="#ec4899" radius={[5, 5, 0, 0]} />
            </BarChart></ResponsiveContainer></div> : <p className="analytics-empty">No new customer accounts in this period.</p>}
          </article>
        </section>

        <section className="analytics-bottom-grid">
          <article className="analytics-card"><div className="analytics-card-heading"><div><h2>Best sellers</h2><p>Units sold in the selected period</p></div></div>
            {data.topProducts?.length ? <div className="analytics-table-wrap"><table><thead><tr><th>Product</th><th>Units</th><th>Item value</th></tr></thead><tbody>{data.topProducts.map((product) => <tr key={product._id}><td>{product._id || "Unnamed product"}</td><td>{product.units}</td><td>{money(product.revenue)}</td></tr>)}</tbody></table></div> : <p className="analytics-empty">No product sales in this period.</p>}
          </article>
          <article className="analytics-card"><div className="analytics-card-heading"><div><h2>Order status</h2><p>Orders in the selected period</p></div></div>
            {Object.keys(data.statusCounts || {}).length ? <ul className="analytics-status-list">{Object.entries(data.statusCounts).map(([status, count]) => <li key={status}><span>{status}</span><strong>{count}</strong></li>)}</ul> : <p className="analytics-empty">No orders in this period.</p>}
          </article>
        </section>
      </>}
    </main>
  );
}
