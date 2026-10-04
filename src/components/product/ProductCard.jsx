import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../hooks/useCart";
import { useToast } from "../../context/ToastContext";
import CartFeedback from "../common/CartFeedback";
import WishlistButton from "./WishlistButton";
import { formatPrice, DEFAULT_STOCK } from "../../utils/helpers";
import "./ProductCard.css";

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const toast = useToast();

  const [buttonState, setButtonState] = useState("idle");
  const [showToast, setShowToast] = useState(false);

  if (!product) return null;

  const stock =
    product.stock === undefined ? DEFAULT_STOCK : Number(product.stock);
  const outOfStock = stock <= 0;
  const lowStock = stock > 0 && stock <= 3;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (buttonState !== "idle" || outOfStock) return;

    const result = addToCart(product, 1);

    if (result.added === 0) {
      toast.error(`You already have all ${stock} available in your cart.`);
      return;
    }

    setShowToast(true);
    setButtonState("adding");

    window.setTimeout(() => setButtonState("added"), 350);
    window.setTimeout(() => setButtonState("idle"), 1300);
  };

  const getButtonText = () => {
    if (outOfStock) return "Out of Stock";
    if (buttonState === "adding") return "Adding...";
    if (buttonState === "added") return "Added ✓";
    return "Add to Cart";
  };

  const rating = Math.min(5, Math.max(0, Math.floor(product.rating || 5)));

  return (
    <>
      <article
        className={`product-card ${outOfStock ? "is-out-of-stock" : ""}`}
      >
        <Link
          to={`/product/${product.id}`}
          className="product-card-link"
        >
          <div className="product-card-image-wrapper">
            <img
              src={product.image}
              alt={product.name}
              className="product-card-image"
              loading="lazy"
              decoding="async"
            />

            {outOfStock && (
              <span className="stock-badge stock-badge-out">
                Out of stock
              </span>
            )}

            {lowStock && (
              <span className="stock-badge stock-badge-low">
                Only {stock} left
              </span>
            )}
          </div>

          <div className="product-card-content">
            <p className="product-card-category">{product.category}</p>

            <h3 className="product-card-title">{product.name}</h3>

            <div className="product-card-rating">
              {"★".repeat(rating)}
              {"☆".repeat(5 - rating)}
            </div>

            <p className="product-card-price">
              {formatPrice(product.price)}
            </p>
          </div>
        </Link>

        <WishlistButton product={product} className="wishlist-on-card" />

        <div className="product-card-actions">
          <button
            type="button"
            className={`product-card-button ${
              buttonState === "adding" ? "is-adding" : ""
            } ${buttonState === "added" ? "is-added" : ""}`}
            onClick={handleAddToCart}
            disabled={buttonState !== "idle" || outOfStock}
          >
            {getButtonText()}
          </button>
        </div>
      </article>

      <CartFeedback
        product={product}
        quantity={1}
        visible={showToast}
        onClose={() => setShowToast(false)}
      />
    </>
  );
};

export default ProductCard;
