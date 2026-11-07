import { Link, useLocation } from "react-router-dom";
import "../styles/orderSuccess.css";

const OrderSuccess = () => {
  const location = useLocation();
  const { orderId, paymentStatus } = location.state || {};
  const paymentConfirmed = paymentStatus === "Paid";

  return (
    <div className="order-success container">
      <div className="success-card">
        <span className="success-icon">🎉</span>

        <h1>{paymentConfirmed ? "Payment confirmed" : "Order received"}</h1>

        <p>
          {paymentConfirmed
            ? "Thank you for your payment and for supporting handmade creations. Your order is confirmed and is being prepared with care."
            : "Thank you for supporting handmade creations. Check My Orders for the latest payment and order status."}
        </p>
        {orderId && <p className="success-order-reference">Order reference: #{String(orderId).slice(-6).toUpperCase()}</p>}

        <div className="success-actions">
          <Link to="/orders" className="btn-secondary">
              View My Orders
          </Link>

          <Link to="/shop" className="btn-primary">
              Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
