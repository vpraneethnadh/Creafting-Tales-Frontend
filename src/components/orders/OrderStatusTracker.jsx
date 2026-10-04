import { ORDER_STEPS } from "../../services/orderService";

const OrderStatusTracker = ({ status }) => {
  if (status === "Cancelled") {
    return (
      <div className="order-cancelled-banner">
        This order was cancelled.
      </div>
    );
  }

  const currentIndex = Math.max(0, ORDER_STEPS.indexOf(status));

  return (
    <ol className="status-tracker" aria-label="Order progress">
      {ORDER_STEPS.map((step, index) => {
        const state =
          index < currentIndex
            ? "done"
            : index === currentIndex
            ? "current"
            : "todo";

        return (
          <li key={step} className={`status-step status-${state}`}>
            <span className="status-dot">
              {state === "done" ? "✓" : index + 1}
            </span>
            <span className="status-label">{step}</span>
          </li>
        );
      })}
    </ol>
  );
};

export default OrderStatusTracker;
