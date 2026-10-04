import { useEffect } from "react";

const CartFeedback = ({
  product,
  quantity = 1,
  visible = false,
  onClose,
}) => {
  useEffect(() => {
    if (!visible) return;

    const timer = window.setTimeout(() => {
      onClose?.();
    }, 2200);

    return () => window.clearTimeout(timer);
  }, [visible, onClose]);

  if (!visible || !product) return null;

  return (
    <div
      className="cart-feedback"
      role="status"
      style={{
        position: "fixed",
        right: "24px",
        bottom: "24px",
        zIndex: 2000,
        width: "320px",
        maxWidth: "calc(100vw - 32px)",
        padding: "14px 16px",
        background: "#ffffff",
        border: "1px solid #eadfdb",
        borderRadius: "12px",
        boxShadow: "0 8px 30px rgba(0, 0, 0, 0.12)",
        display: "flex",
        alignItems: "center",
        gap: "12px",
      }}
    >
      <img
        src={product.image}
        alt={product.name}
        style={{
          width: "52px",
          height: "52px",
          borderRadius: "8px",
          objectFit: "cover",
          flexShrink: 0,
        }}
      />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: "13px",
            fontWeight: "700",
            color: "#152d50",
            marginBottom: "4px",
          }}
        >
          Added to cart
        </div>

        <div
          style={{
            fontSize: "13px",
            color: "#555",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {product.name}
        </div>

        <div
          style={{
            fontSize: "12px",
            color: "#c95b78",
            marginTop: "3px",
          }}
        >
          Quantity: {quantity}
        </div>
      </div>

      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        style={{
          border: "none",
          background: "transparent",
          color: "#777",
          fontSize: "18px",
          cursor: "pointer",
          padding: "4px",
          lineHeight: 1,
        }}
      >
        ×
      </button>
    </div>
  );
};

export default CartFeedback;