import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { getOrderById } from "../../services/orderService";
import OrderItems from "../../components/orders/OrderItems";
import { formatDate, formatPrice } from "../../utils/helpers";

const OrderSuccess = () => {
  const { orderId } = useParams();
  const location = useLocation();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    getOrderById(orderId)
      .then((data) => active && setOrder(data))
      .catch((err) => console.warn("Could not load order:", err.code))
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [orderId]);

  const orderNumber = order?.orderNumber || location.state?.orderNumber;

  return (
    <main className="orders-page">
      <section className="order-success-card">

        <div className="order-success-icon" aria-hidden="true">✓</div>

        <p className="orders-eyebrow">ORDER CONFIRMED</p>

        <h1>Thank you for your order!</h1>

        <p className="order-success-text">
          Your order has been placed successfully. We'll start preparing
          your handmade items with care.
        </p>

        {orderNumber && (
          <div className="order-success-number">
            <span>Order number</span>
            <strong>{orderNumber}</strong>
          </div>
        )}

        {loading && <p className="orders-muted">Loading your order...</p>}

        {order && (
          <div className="order-success-summary">
            <OrderItems items={order.items} />

            <div className="order-total-row">
              <span>Total</span>
              <strong>{formatPrice(order.total)}</strong>
            </div>

            <p className="orders-muted">
              Placed on {formatDate(order.createdAt)} · {order.paymentMethod}
            </p>

            <p className="orders-muted">
              Delivering to {order.customer.fullName}, {order.customer.address},{" "}
              {order.customer.city}, {order.customer.state} -{" "}
              {order.customer.pincode}
            </p>
          </div>
        )}

        <div className="order-success-actions">
          <Link to={`/orders/${orderId}`} className="orders-btn orders-btn-primary">
            View Order
          </Link>
          <Link to="/orders" className="orders-btn orders-btn-secondary">
            All Orders
          </Link>
          <Link to="/shop" className="orders-btn orders-btn-secondary">
            Continue Shopping
          </Link>
        </div>

      </section>
    </main>
  );
};

export default OrderSuccess;
