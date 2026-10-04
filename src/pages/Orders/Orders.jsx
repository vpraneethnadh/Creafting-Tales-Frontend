import { Link } from "react-router-dom";
import { useOrders } from "../../hooks/useOrders";
import StatusBadge from "../../components/orders/StatusBadge";
import Loader from "../../components/common/Loader";
import { formatDate, formatPrice } from "../../utils/helpers";

const Orders = () => {
  const { orders, loading, error, reload } = useOrders();

  if (loading) {
    return <Loader label="Loading your orders..." />;
  }

  const active = orders.filter(
    (o) => o.status !== "Delivered" && o.status !== "Cancelled"
  );
  const past = orders.filter(
    (o) => o.status === "Delivered" || o.status === "Cancelled"
  );

  const renderOrder = (order) => (
    <Link
      to={`/orders/${order.id}`}
      className="order-card"
      key={order.id}
    >
      <div className="order-card-top">
        <div>
          <p className="order-card-number">
            Order #{order.orderNumber || order.id.slice(0, 6).toUpperCase()}
          </p>
          <p className="orders-muted">{formatDate(order.createdAt)}</p>
        </div>

        <StatusBadge status={order.status} />
      </div>

      <ul className="order-card-items">
        {order.items.slice(0, 3).map((item, index) => (
          <li key={`${item.id}-${index}`}>
            {item.name} × {item.quantity}
          </li>
        ))}
        {order.items.length > 3 && (
          <li className="orders-muted">
            + {order.items.length - 3} more item
            {order.items.length - 3 > 1 ? "s" : ""}
          </li>
        )}
      </ul>

      <div className="order-card-bottom">
        <strong>{formatPrice(order.total)}</strong>
        <span>View details →</span>
      </div>
    </Link>
  );

  return (
    <main className="orders-page">
      <section className="orders-container">

        <div className="orders-header">
          <p className="orders-eyebrow">MY ACCOUNT</p>
          <h1>My Orders</h1>
          <p>
            {orders.length > 0
              ? `${orders.length} order${orders.length > 1 ? "s" : ""} · ${active.length} in progress`
              : "Your orders will appear here."}
          </p>
        </div>

        {error && (
          <div className="app-error" role="alert">
            {error}{" "}
            <button type="button" onClick={reload}>
              Try again
            </button>
          </div>
        )}

        {!error && orders.length === 0 && (
          <div className="app-empty-card">
            <div className="app-empty-icon">📦</div>
            <h2>No orders yet</h2>
            <p>Once you place an order it will show up here.</p>
            <Link to="/shop" className="orders-btn orders-btn-primary">
              Start Shopping
            </Link>
          </div>
        )}

        {active.length > 0 && (
          <>
            <h2 className="orders-section-title">Current orders</h2>
            <div className="orders-list">{active.map(renderOrder)}</div>
          </>
        )}

        {past.length > 0 && (
          <>
            <h2 className="orders-section-title">Previous orders</h2>
            <div className="orders-list">{past.map(renderOrder)}</div>
          </>
        )}

      </section>
    </main>
  );
};

export default Orders;
