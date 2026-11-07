import "../styles/orderTimeline.css";

const steps = ["Placed", "Processing", "Shipped", "Out for Delivery", "Delivered"];

const OrderTimeline = ({ status }) => {
  const currentStep = steps.indexOf(status);

  return (
    <div className="order-timeline-wrap" aria-label={`Order status: ${status}`}>
      {status === "Pending Payment" ? (
        <p className="order-timeline-pending">Complete payment to confirm this order.</p>
      ) : status === "Cancelled" ? (
        <p className="order-timeline-cancelled">Order cancelled</p>
      ) : (
        <ol className="order-timeline">
          {steps.map((step, index) => {
            const complete = currentStep >= index;
            return <li className={complete ? "complete" : ""} key={step} aria-current={currentStep === index ? "step" : undefined}>
              <span className="timeline-marker" aria-hidden="true">{complete ? "✓" : ""}</span>
              <span>{step}</span>
            </li>;
          })}
        </ol>
      )}
    </div>
  );
};

export default OrderTimeline;
