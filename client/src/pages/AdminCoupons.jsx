import { useCallback, useEffect, useState } from "react";
import { API_BASE } from "../utils/api";
import { useToast } from "../context/ToastContext";
import "../styles/adminCoupons.css";

const blankCoupon = {
  code: "", description: "", discountType: "percent", discountValue: "10",
  minOrderAmount: "0", maxDiscountAmount: "", startsAt: "", expiresAt: "",
  usageLimit: "", isActive: true,
};
const localDateTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};
const displayDate = (value) => value ? new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "No end date";
const money = (value) => `₹${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

export default function AdminCoupons() {
  const toast = useToast();
  const token = localStorage.getItem("token") || "";
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState(blankCoupon);
  const [editingId, setEditingId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadCoupons = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE}/api/coupons/admin`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || "Could not load coupons");
      setCoupons(data.coupons || []);
    } catch (requestError) {
      setError(requestError.message || "Could not load coupons");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { loadCoupons(); }, [loadCoupons]);

  const change = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
  };

  const resetForm = () => { setForm(blankCoupon); setEditingId(""); };

  const editCoupon = (coupon) => {
    setEditingId(coupon._id);
    setForm({
      code: coupon.code || "", description: coupon.description || "", discountType: coupon.discountType,
      discountValue: String(coupon.discountValue), minOrderAmount: String(coupon.minOrderAmount || 0),
      maxDiscountAmount: coupon.maxDiscountAmount == null ? "" : String(coupon.maxDiscountAmount),
      startsAt: localDateTime(coupon.startsAt), expiresAt: localDateTime(coupon.expiresAt),
      usageLimit: coupon.usageLimit == null ? "" : String(coupon.usageLimit), isActive: coupon.isActive,
    });
    document.querySelector(".coupon-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const saveCoupon = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...form,
        code: form.code.trim().toUpperCase(),
        startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : null,
        expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
      };
      const response = await fetch(`${API_BASE}/api/coupons/admin${editingId ? `/${editingId}` : ""}`, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || "Coupon could not be saved");
      toast.success(data.message || "Coupon saved");
      resetForm();
      await loadCoupons();
    } catch (requestError) {
      setError(requestError.message || "Coupon could not be saved");
    } finally {
      setSaving(false);
    }
  };

  const deactivate = async (coupon) => {
    if (!window.confirm(`Deactivate ${coupon.code}? Customers will no longer be able to apply it.`)) return;
    try {
      const response = await fetch(`${API_BASE}/api/coupons/admin/${coupon._id}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || "Coupon could not be deactivated");
      toast.success(data.message || "Coupon deactivated");
      await loadCoupons();
    } catch (requestError) {
      toast.error(requestError.message || "Coupon could not be deactivated");
    }
  };

  return (
    <main className="admin-coupons-page">
      <header className="admin-coupons-header">
        <div><span>SALES PROMOTIONS</span><h1>Coupons</h1><p>Create discount codes, schedule availability, and set order and usage limits.</p></div>
        <button type="button" onClick={loadCoupons} disabled={loading}>{loading ? "Refreshing…" : "↻ Refresh"}</button>
      </header>

      {error && <p className="coupon-page-error" role="alert">{error}</p>}
      <div className="admin-coupons-layout">
        <section className="coupon-list-panel" aria-label="Coupons">
          <div className="coupon-list-heading"><h2>All codes</h2><span>{coupons.length} total</span></div>
          {loading ? <p className="coupon-list-empty" role="status">Loading coupons…</p> : coupons.length === 0 ? <p className="coupon-list-empty">No coupons yet. Create your first code.</p> : (
            <div className="coupon-list">
              {coupons.map((coupon) => (
                <article className="coupon-card" key={coupon._id}>
                  <div className="coupon-card-title"><div><strong>{coupon.code}</strong><span>{coupon.description || "Discount code"}</span></div><span className={`coupon-active-pill ${coupon.isActive ? "is-active" : "is-inactive"}`}>{coupon.isActive ? "Active" : "Inactive"}</span></div>
                  <p className="coupon-value">{coupon.discountType === "percent" ? `${coupon.discountValue}% off` : `${money(coupon.discountValue)} off`}{coupon.maxDiscountAmount != null && coupon.discountType === "percent" ? ` · up to ${money(coupon.maxDiscountAmount)}` : ""}</p>
                  <div className="coupon-meta"><span>Minimum order: {money(coupon.minOrderAmount)}</span><span>Ends: {displayDate(coupon.expiresAt)}</span><span>Uses: {coupon.usedCount || 0}{coupon.usageLimit == null ? " / unlimited" : ` / ${coupon.usageLimit}`}{coupon.reservedCount ? ` · ${coupon.reservedCount} in checkout` : ""}</span></div>
                  <div className="coupon-card-actions"><button type="button" onClick={() => editCoupon(coupon)}>Edit</button>{coupon.isActive && <button type="button" className="coupon-deactivate" onClick={() => deactivate(coupon)}>Deactivate</button>}</div>
                </article>
              ))}
            </div>
          )}
        </section>

        <form className="coupon-form" onSubmit={saveCoupon}>
          <div className="coupon-form-heading"><div><span>{editingId ? "EDIT OFFER" : "NEW OFFER"}</span><h2>{editingId ? "Update coupon" : "Create coupon"}</h2></div>{editingId && <button type="button" className="coupon-cancel-edit" onClick={resetForm}>Cancel edit</button>}</div>
          <label>Coupon code<input name="code" value={form.code} onChange={change} placeholder="e.g. FESTIVE15" maxLength={32} required /></label>
          <label>Description <small>Optional customer-facing note</small><input name="description" value={form.description} onChange={change} maxLength={160} placeholder="A little thank-you for your order" /></label>
          <div className="coupon-form-row"><label>Discount type<select name="discountType" value={form.discountType} onChange={change}><option value="percent">Percentage</option><option value="fixed">Fixed amount</option></select></label><label>Discount value<input name="discountValue" type="number" min="0.01" max={form.discountType === "percent" ? 100 : undefined} step="0.01" value={form.discountValue} onChange={change} required /></label></div>
          <div className="coupon-form-row"><label>Minimum order (₹)<input name="minOrderAmount" type="number" min="0" step="1" value={form.minOrderAmount} onChange={change} /></label><label>Max discount (₹)<input name="maxDiscountAmount" type="number" min="0.01" step="1" value={form.maxDiscountAmount} onChange={change} placeholder="No cap" /></label></div>
          <div className="coupon-form-row"><label>Starts at<input name="startsAt" type="datetime-local" value={form.startsAt} onChange={change} /></label><label>Expires at<input name="expiresAt" type="datetime-local" value={form.expiresAt} onChange={change} /></label></div>
          <label>Total usage limit<input name="usageLimit" type="number" min="1" step="1" value={form.usageLimit} onChange={change} placeholder="Unlimited" /><small>Successful payments count toward this limit.</small></label>
          <label className="coupon-active-toggle"><input name="isActive" type="checkbox" checked={form.isActive} onChange={change} /> Coupon is active</label>
          <button className="coupon-save-button" type="submit" disabled={saving}>{saving ? "Saving…" : editingId ? "Save changes" : "Create coupon"}</button>
        </form>
      </div>
    </main>
  );
}
