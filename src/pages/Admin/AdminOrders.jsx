import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ORDER_STATUSES,
  getAllOrders,
  updateOrderStatus,
} from "../../services/orderService";
import { useToast } from "../../context/ToastContext";
import OrderItems from "../../components/orders/OrderItems";
import StatusBadge from "../../components/orders/StatusBadge";
import Loader from "../../components/common/Loader";
import {
  formatDateTime,
  formatPrice,
  getFirebaseErrorMessage,
} from "../../utils/helpers";

const AdminOrders = () => {
  const toast = useToast();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState(null);
  const [savingId, setSavingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      setOrders(await getAllOrders());
    } catch (err) {
      console.error(err);
      setError(getFirebaseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();

    return orders.filter((order) => {
      if (filter !== "All" && order.status !== filter) return false;
      if (!term) return true;

      return `${order.orderNumber} ${order.customer?.fullName} ${order.customer?.email} ${order.customer?.phone}`
        .toLowerCase()
        .includes(term);
    });
  }, [orders, filter, search]);

  const changeStatus = async (order, status) => {
    if (status === order.status) return;

    setSavingId(order.id);

    try {
      await updateOrderStatus(order, status);

      setOrders((current) =>
        current.map((o) =>
          o.id === order.id
            ? {
                ...o,
                status,
                statusHistory: [
                  ...(o.statusHistory || []),
                  { status, at: Date.now() },
                ],
              }
            : o
        )
      );

      toast.success(`Order ${order.orderNumber} marked "${status}".`);
    } catch (err) {
      console.error(err);
      toast.error(getFirebaseErrorMessage(err));
    } finally {
      setSavingId(null);
    }
  };

  if (loading) return <Loader label="Loading orders..." />;

  return (
    <div>
      <div className="admin-toolbar">
        <input
          type="search"
          placeholder="Search by order #, name, email, phone"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search orders"
        />

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          aria-label="Filter by status"
        >
          <option value="All">All statuses</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <button type="button" className="admin-btn" onClick={load}>
          Refresh
        </button>
      </div>

      {error && <div className="app-error" role="alert">{error}</div>}

      {!error && visible.length === 0 && (
        <div className="app-empty-card">
          <div className="app-empty-icon">📭</div>
          <h2>No orders found</h2>
          <p>New orders will show up here.</p>
        </div>
      )}

      <div className="admin-order-list">
        {visible.map((order) => {
          const open = openId === order.id;

          return (
            <article className="admin-order" key={order.id}>
              <div className="admin-order-row">
                <button
                  type="button"
                  className="admin-order-summary"
                  onClick={() => setOpenId(open ? null : order.id)}
                  aria-expanded={open}
                >
                  <strong>#{order.orderNumber}</strong>
                  <span>{order.customer?.fullName}</span>
                  <span>{formatDateTime(order.createdAt)}</span>
                  <strong>{formatPrice(order.total)}</strong>
                </button>

                <div className="admin-order-status">
                  <StatusBadge status={order.status} />

                  <select
                    value={order.status}
                    onChange={(e) => changeStatus(order, e.target.value)}
                    disabled={savingId === order.id}
                    aria-label={`Update status for order ${order.orderNumber}`}
                  >
                    {ORDER_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {open && (
                <div className="admin-order-detail">
                  <div>
                    <h4>Customer</h4>
                    <p>
                      {order.customer?.fullName}
                      <br />
                      {order.customer?.phone}
                      <br />
                      {order.customer?.email}
                    </p>

                    <h4>Deliver to</h4>
                    <p>
                      {order.customer?.address}
                      <br />
                      {order.customer?.city}, {order.customer?.state} -{" "}
                      {order.customer?.pincode}
                    </p>

                    <h4>Payment</h4>
                    <p>
                      {order.paymentMethod} · {order.paymentStatus}
                    </p>
                  </div>

                  <div>
                    <h4>Items</h4>
                    <OrderItems items={order.items} />
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
};

export default AdminOrders;
