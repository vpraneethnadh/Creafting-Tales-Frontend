import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { cancelOrder, getOrderById } from "../../services/orderService";
import { useToast } from "../../context/ToastContext";
import OrderStatusTracker from "../../components/orders/OrderStatusTracker";
import OrderItems from "../../components/orders/OrderItems";
import StatusBadge from "../../components/orders/StatusBadge";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import Loader from "../../components/common/Loader";
import {
  formatDate,
  formatDateTime,
  formatPrice,
  getFirebaseErrorMessage,
} from "../../utils/helpers";

const OrderDetails = () => {
  const { orderId } = useParams();
  const toast = useToast();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);

    try {
      const data = await getOrderById(orderId);
      setOrder(data);
      setNotFound(!data);
    } catch (err) {
      // Someone else's order fails the security rules - treat it as missing.
      console.warn("Order unavailable:", err.code);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleCancel = async () => {
    setCancelling(true);

    try {
      await cancelOrder(order);
      toast.success("Your order has been cancelled.");
      setConfirmOpen(false);
      await load();
    } catch (err) {
      console.error(err);
      toast.error(getFirebaseErrorMessage(err));
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return <Loader label="Loading order..." />;
  }

  if (notFound || !order) {
    return (
      <main className="orders-page">
        <section className="app-empty-card">
          <div className="app-empty-icon">🔍</div>
          <h2>Order not found</h2>
          <p>We couldn't find that order on your account.</p>
          <Link to="/orders" className="orders-btn orders-btn-primary">
            Back to My Orders
          </Link>
        </section>
      </main>
    );
  }

  const history = Array.isArray(order.statusHistory)
    ? [...order.statusHistory].reverse()
    : [];

  return (
    <main className="orders-page">
      <section className="orders-container">

        <Link to="/orders" className="orders-back">
          ← All orders
        </Link>

        <div className="order-detail-header">
          <div>
            <p className="orders-eyebrow">ORDER</p>
            <h1>#{order.orderNumber || order.id.slice(0, 6).toUpperCase()}</h1>
            <p className="orders-muted">
              Placed on {formatDate(order.createdAt)}
            </p>
          </div>

          <StatusBadge status={order.status} />
        </div>

        <div className="orders-card">
          <h2>Order status</h2>
          <OrderStatusTracker status={order.status} />

          {order.status === "Order Placed" && (
            <button
              type="button"
              className="orders-btn orders-btn-danger-outline"
              onClick={() => setConfirmOpen(true)}
            >
              Cancel order
            </button>
          )}
        </div>

        <div className="order-detail-grid">

          <div className="orders-card">
            <h2>Items</h2>
            <OrderItems items={order.items} />

            <div className="order-total-row">
              <span>Total</span>
              <strong>{formatPrice(order.total)}</strong>
            </div>
          </div>

          <div className="orders-card">
            <h2>Delivery details</h2>

            <p className="order-address">
              <strong>{order.customer.fullName}</strong>
              <br />
              {order.customer.address}
              <br />
              {order.customer.city}, {order.customer.state} -{" "}
              {order.customer.pincode}
            </p>

            <p className="orders-muted">
              {order.customer.phone}
              <br />
              {order.customer.email}
            </p>

            <h3>Payment</h3>
            <p className="orders-muted">
              {order.paymentMethod || "Cash on Delivery"} ·{" "}
              {order.paymentStatus || "Pending"}
            </p>

            {history.length > 0 && (
              <>
                <h3>Updates</h3>
                <ul className="order-history">
                  {history.map((entry, index) => (
                    <li key={`${entry.status}-${index}`}>
                      <strong>{entry.status}</strong>
                      <span>{formatDateTime(entry.at)}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

        </div>

      </section>

      <ConfirmDialog
        open={confirmOpen}
        title="Cancel this order?"
        message="This can't be undone. You can place a new order any time."
        confirmLabel="Yes, cancel order"
        cancelLabel="Keep my order"
        danger
        busy={cancelling}
        onConfirm={handleCancel}
        onCancel={() => setConfirmOpen(false)}
      />
    </main>
  );
};

export default OrderDetails;
