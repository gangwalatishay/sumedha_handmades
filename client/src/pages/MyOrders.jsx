import { API_BASE } from "../utils/api";
import { useContext, useEffect, useState } from "react";
import { CustomerContext } from "../context/CustomerContext";
import { apiFetch } from "../utils/api";
import OrderTimeline from "../components/OrderTimeline";
import { useToast } from "../context/ToastContext";
import "../styles/customerPayments.css";
import "../styles/customer-orders.css";

const MyOrders = () => {
  const { customer } = useContext(CustomerContext);
  const toast = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!customer) return;

    const fetchOrders = async () => {
      try {
        const data = await apiFetch("/api/orders/customer");
        setOrders(data.orders || []);
      } catch (err) {
        setError(err.message || "Failed to fetch orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [customer]);

  /* ==========================
     ❌ CANCEL ORDER
  ========================== */
  const cancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;

    try {
      const data = await apiFetch(`/api/orders/cancel/${orderId}`, {
        method: "PUT",
      });

      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId ? data.order : order
        )
      );
      toast.success("Order cancelled. Your order status has been updated.");
    } catch (err) {
      toast.error(err.message || "Failed to cancel order");
    }
  };

  /* ==========================
     📄 DOWNLOAD INVOICE (JWT SAFE)
  ========================== */
  const downloadInvoice = async (orderId) => {
    try {
      const res = await fetch(
        `${API_BASE}/api/orders/invoice/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to download invoice");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${orderId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
      toast.success("Invoice downloaded.");
    } catch (err) {
      toast.error(err.message || "Invoice download failed.");
    }
  };

  if (loading) {
    return <main className="my-orders-page"><p role="status">Loading your orders…</p></main>;
  }

  if (error) {
    return (
      <p className="my-orders-error" role="alert">
        {error}
      </p>
    );
  }

  return (
    <main className="my-orders-page">
      <h1>My Orders</h1>

      {orders.length === 0 ? (
        <p style={{ marginTop: "20px" }}>
          You haven’t placed any orders yet.
        </p>
      ) : (
        orders.map((order) => (
          <article key={order._id} className="order-card-customer">
            <p>
              <strong>Order ID:</strong> {order._id}
            </p>

            <p>
              <strong>Status:</strong>{" "}
              <span
                style={{
                  color:
                    order.status === "Cancelled"
                      ? "#ef4444"
                      : "#16a34a",
                }}
              >
                {order.status}
              </span>
            </p>

            {order.paymentStatus && order.paymentStatus !== "Not Recorded" && <p>
              <strong>Payment:</strong>{" "}
              <span className={`customer-payment customer-payment-${order.paymentStatus.toLowerCase().replace(/ /g, "-")}`}>{order.paymentStatus}</span>
              {order.paymentFailureReason && <span className="customer-payment-reason"> — {order.paymentFailureReason}</span>}
            </p>}

            {/* 🟢 ORDER STATUS TIMELINE */}
            <OrderTimeline status={order.status} />

            <p style={{ marginTop: "10px" }}>
              <strong>Total:</strong> ₹{order.totalAmount}
            </p>
            {order.couponCode && <p className="customer-order-coupon"><strong>Coupon:</strong> {order.couponCode} · saved ₹{Number(order.couponDiscount || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</p>}

            <p style={{ fontSize: "14px", color: "#6b7280" }}>
              Placed on{" "}
              {new Date(order.createdAt).toLocaleString()}
            </p>

            <hr style={{ margin: "14px 0" }} />

            {order.items.map((item, i) => (
              <p key={i}>
                {item.name} × {item.qty}
              </p>
            ))}

            {/* 📄 INVOICE */}
            {(!order.paymentStatus || order.paymentStatus === "Paid" || order.paymentStatus === "Not Recorded") && <button
              className="btn-secondary"
              style={{ marginTop: "12px" }}
              onClick={() => downloadInvoice(order._id)}
            >
              📄 Download Invoice
            </button>}

            {/* ❌ CANCEL BUTTON (ONLY IF PLACED) */}
            {order.status === "Placed" && (
              <button
                onClick={() => cancelOrder(order._id)}
                style={{
                  marginTop: "14px",
                  padding: "10px 16px",
                  borderRadius: "8px",
                  border: "none",
                  background: "#ef4444",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                Cancel Order
              </button>
            )}
          </article>
        ))
      )}
    </main>
  );
};

export default MyOrders;
