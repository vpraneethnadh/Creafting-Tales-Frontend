import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useNavigate,
  Link,
} from "react-router-dom";

import {
  QRCodeSVG,
} from "qrcode.react";

import { useCart } from "../../hooks/useCart";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

import {
  db,
  doc,
  setDoc,
  serverTimestamp,
} from "../../firebase/firebase";

import {
  placeOrder,
  PAYMENT_METHODS,
} from "../../services/orderService";

import { getUserProfile } from "../../services/userService";

import {
  formatPrice,
  getFirebaseErrorMessage,
} from "../../utils/helpers";

import "./Checkout.css";

// ---------------------------------------------------------
// EMAIL SERVER
// ---------------------------------------------------------

const EMAIL_SERVER_URL = "http://localhost:5000";

// ---------------------------------------------------------
// UPI DETAILS
// ---------------------------------------------------------

const UPI_ID = "9573267424@superyes";
const UPI_NAME = "Crafting Tales";

// ---------------------------------------------------------
// EMPTY FORM
// ---------------------------------------------------------

const emptyForm = {
  fullName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
};

// ---------------------------------------------------------
// VALIDATION
// ---------------------------------------------------------

const validate = (form) => {
  if (!form.fullName.trim()) {
    return "Please enter your full name.";
  }

  if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
    return "Please enter a valid email address.";
  }

  if (
    !/^[6-9]\d{9}$/.test(
      form.phone.replace(/[\s-]/g, "")
    )
  ) {
    return "Please enter a valid 10-digit mobile number.";
  }

  if (form.address.trim().length < 6) {
    return "Please enter your full delivery address.";
  }

  if (!form.city.trim()) {
    return "Please enter your city.";
  }

  if (!form.state.trim()) {
    return "Please enter your state.";
  }

  if (!/^\d{6}$/.test(form.pincode.trim())) {
    return "Please enter a valid 6-digit PIN code.";
  }

  return "";
};

// ---------------------------------------------------------
// CREATE UPI PAYMENT LINK
// ---------------------------------------------------------

const createUPILink = (amount) => {
  const params = new URLSearchParams({
    pa: UPI_ID,
    pn: UPI_NAME,
    am: Number(amount).toFixed(2),
    cu: "INR",
  });

  return `upi://pay?${params.toString()}`;
};

// ---------------------------------------------------------
// CHECKOUT
// ---------------------------------------------------------

const Checkout = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const {
    user,
    loading: authLoading,
  } = useAuth();

  const {
    cart,
    cartTotal,
    clearCart,
    hasStockIssues,
  } = useCart();

  const [formData, setFormData] = useState(emptyForm);

  const [saveAddress, setSaveAddress] = useState(true);

  const [paymentMethod, setPaymentMethod] = useState(
    PAYMENT_METHODS.COD
  );

  const [paymentConfirmed, setPaymentConfirmed] =
    useState(false);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const orderPlaced = useRef(false);
  const prefilled = useRef(false);

  // -------------------------------------------------------
  // PRE-FILL CUSTOMER DETAILS
  // -------------------------------------------------------

  useEffect(() => {
    if (!user || prefilled.current) {
      return;
    }

    prefilled.current = true;

    setFormData((prev) => ({
      ...prev,
      fullName:
        prev.fullName ||
        user.displayName ||
        "",
      email:
        prev.email ||
        user.email ||
        "",
    }));

    getUserProfile(user.uid)
      .then((profile) => {
        if (!profile) return;

        setFormData((prev) => ({
          ...prev,

          fullName:
            prev.fullName ||
            profile.name ||
            "",

          phone:
            prev.phone ||
            profile.phone ||
            "",

          address:
            prev.address ||
            profile.address?.address ||
            "",

          city:
            prev.city ||
            profile.address?.city ||
            "",

          state:
            prev.state ||
            profile.address?.state ||
            "",

          pincode:
            prev.pincode ||
            profile.address?.pincode ||
            "",
        }));
      })
      .catch((err) => {
        console.warn(
          "Could not load saved address:",
          err.code
        );
      });
  }, [user]);

  // -------------------------------------------------------
  // FORM CHANGE
  // -------------------------------------------------------

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // -------------------------------------------------------
  // PAYMENT METHOD
  // -------------------------------------------------------

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
    setPaymentConfirmed(false);
    setError("");
  };

  // -------------------------------------------------------
  // SEND ORDER EMAILS
  // -------------------------------------------------------

  const sendOrderEmails = async ({
    orderNumber,
    customer,
    items,
    total,
    paymentMethod,
  }) => {
    try {
      console.log("📧 Sending order emails...");

      const response = await fetch(
        `${EMAIL_SERVER_URL}/api/send-order-email`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            orderNumber,

            customer: {
              fullName: customer.fullName,
              email: customer.email,
              phone: customer.phone,
              address: customer.address,
              city: customer.city,
              state: customer.state,
              pincode: customer.pincode,
            },

            items: items.map((item) => ({
              id: String(item.id),

              name: item.name,

              quantity:
                Number(item.quantity),

              price:
                Number(item.price),

              category:
                item.category || "",
            })),

            total: Number(total),

            paymentMethod,
          }),
        }
      );

      const result = await response.json();

      if (
        !response.ok ||
        !result.success
      ) {
        console.warn(
          "⚠️ Order email request failed:",
          result
        );

        return {
          success: false,
          result,
        };
      }

      console.log(
        "✅ Order emails sent successfully.",
        result
      );

      return {
        success: true,
        result,
      };
    } catch (emailError) {
      console.warn(
        "⚠️ Could not connect to email server:",
        emailError
      );

      return {
        success: false,
        error: emailError,
      };
    }
  };

  // -------------------------------------------------------
  // PLACE ORDER
  // -------------------------------------------------------

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (loading) return;

    setError("");

    // LOGIN
    if (!user) {
      setError(
        "Please login before placing an order."
      );
      return;
    }

    // EMPTY CART
    if (cart.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    // STOCK
    if (hasStockIssues) {
      setError(
        "Some items in your cart are out of stock or exceed what we have. Please update your cart."
      );
      return;
    }

    // VALIDATION
    const validationError =
      validate(formData);

    if (validationError) {
      setError(validationError);
      return;
    }

    // UPI CONFIRMATION
    if (
      paymentMethod === PAYMENT_METHODS.UPI &&
      !paymentConfirmed
    ) {
      setError(
        "Please complete the UPI payment and confirm it before placing the order."
      );
      return;
    }

    setLoading(true);

    try {
      // ---------------------------------------------------
      // CUSTOMER
      // ---------------------------------------------------

      const customer = {
        fullName:
          formData.fullName.trim(),

        email:
          formData.email.trim(),

        phone:
          formData.phone.replace(
            /[\s-]/g,
            ""
          ),

        address:
          formData.address.trim(),

        city:
          formData.city.trim(),

        state:
          formData.state.trim(),

        pincode:
          formData.pincode.trim(),
      };

      // ---------------------------------------------------
      // CREATE FIRESTORE ORDER
      // ---------------------------------------------------

      const {
        id,
        orderNumber,
      } = await placeOrder({
        user,
        customer,
        items: cart,
        total: cartTotal,
        paymentMethod,
      });

      console.log(
        "✅ Order created:",
        orderNumber
      );

      orderPlaced.current = true;

      // ---------------------------------------------------
      // SAVE CUSTOMER ADDRESS
      // ---------------------------------------------------

      if (saveAddress) {
        setDoc(
          doc(
            db,
            "users",
            user.uid
          ),

          {
            phone: customer.phone,

            address: {
              address:
                customer.address,

              city:
                customer.city,

              state:
                customer.state,

              pincode:
                customer.pincode,
            },

            updatedAt:
              serverTimestamp(),
          },

          {
            merge: true,
          }
        ).catch((err) => {
          console.warn(
            "Could not save address:",
            err.code
          );
        });
      }

      // ---------------------------------------------------
      // SEND EMAILS
      // ---------------------------------------------------

      const emailResult =
        await sendOrderEmails({
          orderNumber,
          customer,
          items: cart,
          total: cartTotal,
          paymentMethod,
        });

      if (!emailResult.success) {
        console.warn(
          "Order was created, but email notification failed."
        );
      }

      // ---------------------------------------------------
      // CLEAR CART
      // ---------------------------------------------------

      clearCart();

      // ---------------------------------------------------
      // SUCCESS
      // ---------------------------------------------------

      navigate(
        `/order-success/${id}`,
        {
          replace: true,

          state: {
            orderNumber,
          },
        }
      );
    } catch (err) {
      console.error(
        "❌ Order creation failed:",
        err
      );

      const message =
        getFirebaseErrorMessage(err);

      setError(message);

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------
  // AUTH LOADING
  // -------------------------------------------------------

  if (authLoading) {
    return (
      <main className="checkout-page">
        <section className="checkout-login-required">
          <p className="checkout-eyebrow">
            SECURE CHECKOUT
          </p>

          <p>Loading...</p>
        </section>
      </main>
    );
  }

  // -------------------------------------------------------
  // LOGIN REQUIRED
  // -------------------------------------------------------

  if (!user) {
    return (
      <main className="checkout-page">
        <section className="checkout-login-required">
          <p className="checkout-eyebrow">
            SECURE CHECKOUT
          </p>

          <h1>Login Required</h1>

          <p>
            Please login before proceeding
            with checkout.
          </p>

          <Link
            to="/login"
            state={{
              from: "/checkout",
            }}
            className="checkout-primary-button"
          >
            Login
          </Link>

          <Link
            to="/cart"
            className="checkout-back-link"
          >
            ← Back to cart
          </Link>
        </section>
      </main>
    );
  }

  // -------------------------------------------------------
  // EMPTY CART
  // -------------------------------------------------------

  if (
    cart.length === 0 &&
    !orderPlaced.current
  ) {
    return (
      <main className="checkout-page">
        <section className="checkout-login-required">
          <p className="checkout-eyebrow">
            SECURE CHECKOUT
          </p>

          <h1>Your Cart is Empty</h1>

          <p>
            Add some handmade creations
            before checking out.
          </p>

          <Link
            to="/shop"
            className="checkout-primary-button"
          >
            Continue Shopping
          </Link>
        </section>
      </main>
    );
  }

  const upiLink =
    createUPILink(cartTotal);

  // -------------------------------------------------------
  // PAGE
  // -------------------------------------------------------

  return (
    <main className="checkout-page">

      {/* HEADER */}

      <section className="checkout-header">
        <p className="checkout-eyebrow">
          SECURE CHECKOUT
        </p>

        <h1>Checkout</h1>

        <p>
          Complete your details to place
          your order.
        </p>
      </section>

      <div className="checkout-layout">

        {/* =================================================
            FORM
        ================================================= */}

        <form
          className="checkout-form-card checkout-form"
          onSubmit={handlePlaceOrder}
          noValidate
        >

          {error && (
            <div
              className="checkout-error"
              role="alert"
            >
              {error}
            </div>
          )}

          {/* CONTACT */}

          <div className="checkout-section-heading">
            <span>1</span>

            <div>
              <h2>
                Contact Information
              </h2>

              <p>
                We'll use these details to
                reach you about your order.
              </p>
            </div>
          </div>

          <div className="checkout-field">
            <label htmlFor="fullName">
              Full Name
            </label>

            <input
              id="fullName"
              name="fullName"
              type="text"
              autoComplete="name"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter your full name"
              disabled={loading}
              required
            />
          </div>

          <div className="checkout-two-column">

            <div className="checkout-field">
              <label htmlFor="email">
                Email Address
              </label>

              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                disabled={loading}
                required
              />
            </div>

            <div className="checkout-field">
              <label htmlFor="phone">
                Phone Number
              </label>

              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                inputMode="numeric"
                value={formData.phone}
                onChange={handleChange}
                placeholder="10-digit mobile number"
                maxLength={10}
                disabled={loading}
                required
              />
            </div>

          </div>

          {/* DELIVERY */}

          <div className="checkout-section-heading checkout-delivery-heading">
            <span>2</span>

            <div>
              <h2>
                Delivery Address
              </h2>

              <p>
                Where should we deliver
                your order?
              </p>
            </div>
          </div>

          <div className="checkout-field">
            <label htmlFor="address">
              Full Address
            </label>

            <textarea
              id="address"
              name="address"
              rows={4}
              autoComplete="street-address"
              value={formData.address}
              onChange={handleChange}
              placeholder="House / Flat number, street, area..."
              disabled={loading}
              required
            />
          </div>

          <div className="checkout-two-column">

            <div className="checkout-field">
              <label htmlFor="city">
                City
              </label>

              <input
                id="city"
                name="city"
                type="text"
                autoComplete="address-level2"
                value={formData.city}
                onChange={handleChange}
                placeholder="City"
                disabled={loading}
                required
              />
            </div>

            <div className="checkout-field">
              <label htmlFor="state">
                State
              </label>

              <input
                id="state"
                name="state"
                type="text"
                autoComplete="address-level1"
                value={formData.state}
                onChange={handleChange}
                placeholder="State"
                disabled={loading}
                required
              />
            </div>

          </div>

          <div className="checkout-field">
            <label htmlFor="pincode">
              PIN Code
            </label>

            <input
              id="pincode"
              name="pincode"
              type="text"
              inputMode="numeric"
              autoComplete="postal-code"
              value={formData.pincode}
              onChange={handleChange}
              placeholder="6-digit PIN code"
              maxLength={6}
              disabled={loading}
              required
            />
          </div>

          {/* SAVE ADDRESS */}

          <label className="checkout-save-address">
            <input
              type="checkbox"
              checked={saveAddress}
              onChange={(e) =>
                setSaveAddress(
                  e.target.checked
                )
              }
              disabled={loading}
            />

            <span>
              Save this address for my
              next order
            </span>
          </label>

          {/* PAYMENT */}

          <div className="checkout-section-heading checkout-payment-heading">
            <span>3</span>

            <div>
              <h2>Payment</h2>

              <p>
                Choose how you'd like to
                pay for your order.
              </p>
            </div>
          </div>

          <div className="checkout-payment-methods">

            {/* COD */}

            <button
              type="button"
              className={`checkout-payment-method ${
                paymentMethod ===
                PAYMENT_METHODS.COD
                  ? "selected"
                  : ""
              }`}
              onClick={() =>
                handlePaymentMethodChange(
                  PAYMENT_METHODS.COD
                )
              }
              disabled={loading}
            >
              <span className="checkout-payment-radio">
                <span />
              </span>

              <span className="checkout-payment-content">
                <strong>
                  Cash on Delivery
                </strong>

                <small>
                  Pay when your order is
                  delivered.
                </small>
              </span>

              <span className="checkout-payment-badge">
                COD
              </span>
            </button>

            {/* UPI */}

            <button
              type="button"
              className={`checkout-payment-method ${
                paymentMethod ===
                PAYMENT_METHODS.UPI
                  ? "selected"
                  : ""
              }`}
              onClick={() =>
                handlePaymentMethodChange(
                  PAYMENT_METHODS.UPI
                )
              }
              disabled={loading}
            >
              <span className="checkout-payment-radio">
                <span />
              </span>

              <span className="checkout-payment-content">
                <strong>
                  Pay by UPI
                </strong>

                <small>
                  Scan the QR code and pay
                  securely using any UPI app.
                </small>
              </span>

              <span className="checkout-payment-badge">
                UPI
              </span>
            </button>

          </div>

          {/* UPI QR */}

          {paymentMethod ===
            PAYMENT_METHODS.UPI && (
            <div className="checkout-upi-box">

              <div className="checkout-upi-header">
                <span className="checkout-upi-icon">
                  ₹
                </span>

                <div>
                  <h3>
                    Scan & Pay
                  </h3>

                  <p>
                    Scan this QR code using
                    Google Pay, PhonePe,
                    Paytm or another UPI app.
                  </p>
                </div>
              </div>

              <div className="checkout-qr-card">
                <QRCodeSVG
                  value={upiLink}
                  size={200}
                  bgColor="#ffffff"
                  fgColor="#152d50"
                  level="H"
                  includeMargin
                />
              </div>

              <div className="checkout-upi-details">

                <div>
                  <span>UPI ID</span>
                  <strong>{UPI_ID}</strong>
                </div>

                <div>
                  <span>Amount</span>
                  <strong>
                    {formatPrice(cartTotal)}
                  </strong>
                </div>

              </div>

              <div className="checkout-upi-note">
                <strong>
                  Payment verification
                </strong>

                <p>
                  Complete the payment and
                  confirm below. Your payment
                  will be manually verified
                  before the order is processed.
                </p>
              </div>

              <label className="checkout-payment-confirmation">

                <input
                  type="checkbox"
                  checked={paymentConfirmed}
                  onChange={(e) =>
                    setPaymentConfirmed(
                      e.target.checked
                    )
                  }
                  disabled={loading}
                />

                <span>
                  I have completed the UPI
                  payment.
                </span>

              </label>

            </div>
          )}

          {/* SUBMIT */}

          <button
            type="submit"
            className="checkout-submit-button"
            disabled={loading}
          >
            {loading
              ? "Placing Order..."
              : `Place Order • ${formatPrice(
                  cartTotal
                )}`}
          </button>

        </form>

        {/* =================================================
            ORDER SUMMARY
        ================================================= */}

        <aside className="checkout-summary">

          <div className="checkout-summary-header">

            <span className="checkout-summary-label">
              YOUR ORDER
            </span>

            <h2>
              Order Summary
            </h2>

            <p>
              {cart.length} item
              {cart.length !== 1
                ? "s"
                : ""} in your order
            </p>

          </div>

          <div className="checkout-summary-items">

            {cart.map((item) => (
              <div
                key={item.id}
                className="checkout-summary-item"
              >

                <div className="checkout-summary-item-info">

                  <div className="checkout-summary-item-image">

                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                      />
                    ) : (
                      <span>
                        No Image
                      </span>
                    )}

                  </div>

                  <div className="checkout-summary-item-text">

                    <strong>
                      {item.name}
                    </strong>

                    <span>
                      Qty: {item.quantity}
                    </span>

                  </div>

                </div>

                <strong className="checkout-summary-item-price">
                  {formatPrice(
                    Number(item.price) *
                      Number(item.quantity)
                  )}
                </strong>

              </div>
            ))}

          </div>

          <div className="checkout-summary-details">

            <div className="checkout-summary-row">
              <span>
                Subtotal
              </span>

              <strong>
                {formatPrice(cartTotal)}
              </strong>
            </div>

            <div className="checkout-summary-row">
              <span>
                Delivery
              </span>

              <strong className="checkout-free">
                Free
              </strong>
            </div>

            <div className="checkout-summary-divider" />

            <div className="checkout-summary-total">

              <div>
                <span>
                  Total
                </span>

                <small>
                  Inclusive of delivery
                </small>
              </div>

              <strong>
                {formatPrice(cartTotal)}
              </strong>

            </div>

          </div>

          <div className="checkout-summary-payment-note">
            <span>✓</span>

            <p>
              Secure checkout
              <br />
              Your order details are safely
              stored with Crafting Tales.
            </p>
          </div>

          <Link
            to="/cart"
            className="checkout-cart-link"
          >
            ← Back to cart
          </Link>

        </aside>

      </div>

    </main>
  );
};

export default Checkout;