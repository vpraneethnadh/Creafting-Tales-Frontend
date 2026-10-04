import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { formatPrice } from "../utils/helpers";
import "./Cart.css";

const Cart = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  const {
    cart,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    cartTotal,
    clearCart,
    hasStockIssues,
  } = useCart();

  /* =========================================
     CHECKOUT
  ========================================= */

  const handleCheckout = () => {
    if (hasStockIssues) {
      toast.error(
        "Some items in your cart are unavailable or exceed our stock. Please update them first."
      );
      return;
    }

    if (!user) {
      // Remember where they were going, then come back after login.
      navigate("/login", { state: { from: "/checkout" } });
      return;
    }

    navigate("/checkout");
  };

  const handleIncrease = (item) => {
    if (!increaseQuantity(item.id)) {
      toast.info(`Only ${item.stock} of "${item.name}" available.`);
    }
  };

  /* =========================================
     EMPTY CART
  ========================================= */

  if (cart.length === 0) {
    return (
      <main className="cart-page">
        <section className="empty-cart">
          <p className="cart-eyebrow">
            YOUR SHOPPING BAG
          </p>

          <h1>Your Cart is Empty</h1>

          <p>
            Discover our handmade creations and find
            something special for every occasion.
          </p>

          <Link
            to="/shop"
            className="continue-shopping"
          >
            Continue Shopping
          </Link>
        </section>
      </main>
    );
  }

  /* =========================================
     CART PAGE
  ========================================= */

  return (
    <main className="cart-page">

      {/* =====================================
          HEADER
      ===================================== */}

      <section className="cart-header">
        <p className="cart-eyebrow">
          YOUR SHOPPING BAG
        </p>

        <h1>Your Cart</h1>

        <p>
          Review your handmade creations before checkout.
        </p>
      </section>

      {/* =====================================
          MAIN LAYOUT
      ===================================== */}

      <div className="cart-layout">

        {/* =====================================
            CART ITEMS
        ===================================== */}

        <section className="cart-items">

          {cart.map((item) => (
            <article
              className="cart-item"
              key={item.id}
            >

              {/* Product Image */}

              <Link
                to={`/product/${item.id}`}
                className="cart-item-image-link"
              >
                <div className="cart-item-image-wrapper">

                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="cart-item-image"
                    />
                  ) : (
                    <div className="cart-image-placeholder">
                      Image unavailable
                    </div>
                  )}

                </div>
              </Link>

              {/* Product Details */}

              <div className="cart-item-details">

                <p className="cart-item-category">
                  {item.category}
                </p>

                <Link
                  to={`/product/${item.id}`}
                  className="cart-item-name"
                >
                  {item.name}
                </Link>

                <p className="cart-item-price">
                  {formatPrice(item.price)}
                </p>

                {item.unavailable && (
                  <p className="cart-item-warning">
                    This item is currently out of stock - please remove it.
                  </p>
                )}

                {item.exceedsStock && (
                  <p className="cart-item-warning">
                    Only {item.stock} available - please reduce the quantity.
                  </p>
                )}

                {/* Quantity + Remove */}

                <div className="cart-item-bottom">

                  <div className="cart-quantity">

                    <button
                      type="button"
                      aria-label={`Decrease quantity of ${item.name}`}
                      onClick={() =>
                        decreaseQuantity(item.id)
                      }
                    >
                      −
                    </button>

                    <span>
                      {item.quantity}
                    </span>

                    <button
                      type="button"
                      aria-label={`Increase quantity of ${item.name}`}
                      disabled={item.quantity >= item.stock}
                      onClick={() => handleIncrease(item)}
                    >
                      +
                    </button>

                  </div>

                  <button
                    type="button"
                    className="remove-item"
                    onClick={() =>
                      removeFromCart(item.id)
                    }
                  >
                    Remove
                  </button>

                </div>

              </div>

            </article>
          ))}

          {/* =====================================
              CLEAR CART
          ===================================== */}

          <button
            type="button"
            className="checkout-button"
            onClick={clearCart}
          >
            Clear Cart
          </button>

        </section>

        {/* =====================================
            ORDER SUMMARY
        ===================================== */}

        <aside className="order-summary">

          <h2>Order Summary</h2>

          <div className="summary-row">

            <span>Subtotal</span>

            <strong>
              {formatPrice(cartTotal)}
            </strong>

          </div>

          <div className="summary-row">

            <span>Delivery</span>

            <span className="delivery-note">
              Calculated at checkout
            </span>

          </div>

          <div className="summary-divider" />

          <div className="summary-total">

            <span>Total</span>

            <strong>
              {formatPrice(cartTotal)}
            </strong>

          </div>

          {/* =====================================
              CHECKOUT
          ===================================== */}

          <button
            type="button"
            className="checkout-button"
            onClick={handleCheckout}
            disabled={hasStockIssues}
          >
            Proceed to Checkout
          </button>

        </aside>

      </div>

    </main>
  );
};

export default Cart;