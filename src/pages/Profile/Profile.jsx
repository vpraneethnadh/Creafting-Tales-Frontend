import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  auth,
  db,
  doc,
  setDoc,
  signOut,
  updateProfile,
  serverTimestamp,
} from "../../firebase/firebase";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { useOrders } from "../../hooks/useOrders";
import { getUserProfile } from "../../services/userService";
import StatusBadge from "../../components/orders/StatusBadge";
import Loader from "../../components/common/Loader";
import {
  formatDate,
  formatPrice,
  getFirebaseErrorMessage,
} from "../../utils/helpers";
import "./Profile.css";

const emptyProfile = {
  name: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
};

const Profile = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { user, loading: authLoading, isAdmin, refreshUser } = useAuth();
  const { orders, loading: ordersLoading, error: ordersError } = useOrders();

  const [form, setForm] = useState(emptyProfile);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);

  // Load saved profile (phone + address) from Firestore.
  useEffect(() => {
    if (!user) return undefined;

    let active = true;

    getUserProfile(user.uid)
      .then((profile) => {
        if (!active) return;
        setForm({
          name: profile?.name || user.displayName || "",
          phone: profile?.phone || "",
          address: profile?.address?.address || "",
          city: profile?.address?.city || "",
          state: profile?.address?.state || "",
          pincode: profile?.address?.pincode || "",
        });
      })
      .catch((err) => {
        console.warn("Could not load profile:", err.code);
        if (active) {
          setForm((prev) => ({ ...prev, name: user.displayName || "" }));
        }
      })
      .finally(() => active && setProfileLoaded(true));

    return () => {
      active = false;
    };
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Couldn't log out. Please try again.");
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      toast.error("Please enter your name.");
      return;
    }

    if (form.phone && !/^[6-9]\d{9}$/.test(form.phone.replace(/[\s-]/g, ""))) {
      toast.error("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (form.pincode && !/^\d{6}$/.test(form.pincode.trim())) {
      toast.error("PIN code must be 6 digits.");
      return;
    }

    setSaving(true);

    try {
      if (form.name.trim() !== (user.displayName || "")) {
        await updateProfile(auth.currentUser, {
          displayName: form.name.trim(),
        });
      }

      await setDoc(
        doc(db, "users", user.uid),
        {
          name: form.name.trim(),
          email: user.email || "",
          phone: form.phone.replace(/[\s-]/g, ""),
          address: {
            address: form.address.trim(),
            city: form.city.trim(),
            state: form.state.trim(),
            pincode: form.pincode.trim(),
          },
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      await refreshUser();
      setEditing(false);
      toast.success("Profile updated.");
    } catch (err) {
      console.error(err);
      toast.error(getFirebaseErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return <Loader label="Loading profile..." />;
  }

  if (!user) {
    return (
      <main className="profile-page">
        <section className="profile-login-card">
          <p className="profile-eyebrow">ACCOUNT</p>

          <h1>Please Sign In</h1>

          <p>
            Sign in to view your profile, purchases and order history.
          </p>

          <Link
            to="/login"
            state={{ from: "/profile" }}
            className="profile-login-button"
          >
            Sign In
          </Link>
        </section>
      </main>
    );
  }

  const providers = (user.providerData || []).map((p) => p.providerId);
  const loginMethod = providers.includes("google.com")
    ? "Google"
    : providers.includes("password")
    ? "Email & password"
    : "Account";

  const currentOrders = orders.filter(
    (o) => o.status !== "Delivered" && o.status !== "Cancelled"
  );
  const deliveredOrders = orders.filter((o) => o.status === "Delivered");
  const recentOrders = orders.slice(0, 3);

  const hasAddress = form.address || form.city || form.state || form.pincode;

  return (
    <main className="profile-page">
      <section className="profile-container">

        <div className="profile-header">
          <p className="profile-eyebrow">MY ACCOUNT</p>

          <h1>My Profile</h1>

          <p>
            Manage your Crafting Tales account and view your purchases.
          </p>
        </div>

        <div className="profile-grid">

          {/* ---------- USER CARD ---------- */}
          <section className="profile-card profile-user-card">
            <div className="profile-avatar-wrapper">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || "Profile"}
                  className="profile-avatar"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="profile-avatar-placeholder">👤</div>
              )}
            </div>

            <h2>{user.displayName || "Crafting Tales Customer"}</h2>

            <p className="profile-email">{user.email}</p>

            {isAdmin && (
              <Link to="/admin" className="profile-admin-link">
                Open admin panel
              </Link>
            )}

            <button
              type="button"
              className="profile-logout"
              onClick={handleLogout}
            >
              Logout
            </button>
          </section>

          {/* ---------- ORDER STATS ---------- */}
          <section className="profile-card">
            <div className="profile-card-header">
              <div>
                <p className="profile-card-eyebrow">OVERVIEW</p>
                <h2>Your Orders</h2>
              </div>
              <span className="profile-card-icon">🛍</span>
            </div>

            <div className="profile-stats">
              <div className="profile-stat">
                <strong>{ordersLoading ? "–" : orders.length}</strong>
                <span>Total</span>
              </div>
              <div className="profile-stat">
                <strong>{ordersLoading ? "–" : currentOrders.length}</strong>
                <span>In progress</span>
              </div>
              <div className="profile-stat">
                <strong>{ordersLoading ? "–" : deliveredOrders.length}</strong>
                <span>Delivered</span>
              </div>
            </div>

            <Link to="/orders" className="profile-shop-button">
              View all orders
            </Link>
          </section>

          {/* ---------- ORDER HISTORY ---------- */}
          <section className="profile-card profile-card-wide">
            <div className="profile-card-header">
              <div>
                <p className="profile-card-eyebrow">ORDERS</p>
                <h2>Order History</h2>
              </div>
              <span className="profile-card-icon">📦</span>
            </div>

            {ordersLoading && <p className="orders-muted">Loading orders...</p>}

            {ordersError && (
              <div className="app-error" role="alert">{ordersError}</div>
            )}

            {!ordersLoading && !ordersError && orders.length === 0 && (
              <div className="profile-empty">
                <div className="profile-empty-icon">📦</div>

                <h3>No orders yet</h3>

                <p>
                  Your purchases will appear here once you place an order.
                </p>

                <Link to="/shop" className="profile-shop-button">
                  Start Shopping
                </Link>
              </div>
            )}

            {recentOrders.length > 0 && (
              <div className="profile-orders">
                {recentOrders.map((order) => (
                  <Link
                    to={`/orders/${order.id}`}
                    className="profile-order-row"
                    key={order.id}
                  >
                    <div>
                      <strong>
                        #{order.orderNumber || order.id.slice(0, 6).toUpperCase()}
                      </strong>
                      <span>
                        {formatDate(order.createdAt)} · {order.items.length} item
                        {order.items.length > 1 ? "s" : ""}
                      </span>
                    </div>

                    <div className="profile-order-right">
                      <StatusBadge status={order.status} />
                      <strong>{formatPrice(order.total)}</strong>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* ---------- ACCOUNT DETAILS ---------- */}
          <section className="profile-card profile-card-wide">
            <div className="profile-card-header">
              <div>
                <p className="profile-card-eyebrow">ACCOUNT</p>
                <h2>Account Details</h2>
              </div>

              {!editing && (
                <button
                  type="button"
                  className="profile-edit-button"
                  onClick={() => setEditing(true)}
                  disabled={!profileLoaded}
                >
                  Edit profile
                </button>
              )}
            </div>

            {!editing ? (
              <div className="profile-details">
                <div className="profile-detail-row">
                  <span>Name</span>
                  <strong>{form.name || user.displayName || "Not available"}</strong>
                </div>

                <div className="profile-detail-row">
                  <span>Email</span>
                  <strong>{user.email}</strong>
                </div>

                <div className="profile-detail-row">
                  <span>Phone</span>
                  <strong>{form.phone || "Not added"}</strong>
                </div>

                <div className="profile-detail-row">
                  <span>Saved address</span>
                  <strong>
                    {hasAddress
                      ? [form.address, form.city, form.state, form.pincode]
                          .filter(Boolean)
                          .join(", ")
                      : "Not added"}
                  </strong>
                </div>

                <div className="profile-detail-row">
                  <span>Login method</span>
                  <strong>{loginMethod}</strong>
                </div>
              </div>
            ) : (
              <form className="profile-form" onSubmit={handleSave}>
                <div className="profile-form-field">
                  <label htmlFor="p-name">Full name</label>
                  <input
                    id="p-name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    disabled={saving}
                    required
                  />
                </div>

                <div className="profile-form-field">
                  <label htmlFor="p-phone">Phone</label>
                  <input
                    id="p-phone"
                    name="phone"
                    type="tel"
                    inputMode="numeric"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="10-digit mobile number"
                    disabled={saving}
                  />
                </div>

                <div className="profile-form-field profile-form-full">
                  <label htmlFor="p-address">Address</label>
                  <textarea
                    id="p-address"
                    name="address"
                    rows="2"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="House number, street, area"
                    disabled={saving}
                  />
                </div>

                <div className="profile-form-field">
                  <label htmlFor="p-city">City</label>
                  <input
                    id="p-city"
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    disabled={saving}
                  />
                </div>

                <div className="profile-form-field">
                  <label htmlFor="p-state">State</label>
                  <input
                    id="p-state"
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                    disabled={saving}
                  />
                </div>

                <div className="profile-form-field">
                  <label htmlFor="p-pincode">PIN code</label>
                  <input
                    id="p-pincode"
                    name="pincode"
                    inputMode="numeric"
                    maxLength={6}
                    value={form.pincode}
                    onChange={handleChange}
                    disabled={saving}
                  />
                </div>

                <div className="profile-form-actions profile-form-full">
                  <button
                    type="submit"
                    className="profile-save-button"
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save changes"}
                  </button>

                  <button
                    type="button"
                    className="profile-cancel-button"
                    onClick={() => setEditing(false)}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </section>

        </div>
      </section>
    </main>
  );
};

export default Profile;
