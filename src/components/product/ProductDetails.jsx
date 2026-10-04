import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useProducts } from "../../context/ProductsContext";
import { useCart } from "../../hooks/useCart";
import { useToast } from "../../context/ToastContext";
import CartFeedback from "../common/CartFeedback";
import ProductCard from "./ProductCard";
import WishlistButton from "./WishlistButton";
import { formatPrice, DEFAULT_STOCK } from "../../utils/helpers";
import "./ProductDetails.css";

const ProductDetails = () => {
  const { id } = useParams();
  const { getProductById, products } = useProducts();
  const { addToCart, cart } = useCart();
  const toast = useToast();

  const product = getProductById(id);

  const [quantity, setQuantity] = useState(1);
  const [buttonState, setButtonState] = useState("idle");
  const [showToast, setShowToast] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [lastAdded, setLastAdded] = useState(1);

  // Reset when navigating between products (e.g. via "Related products").
  useEffect(() => {
    setQuantity(1);
    setActiveImage(0);
    setButtonState("idle");
  }, [id]);

  const related = useMemo(() => {
    if (!product) return [];
    return products
      .filter(
        (p) =>
          p.category === product.category &&
          String(p.id) !== String(product.id)
      )
      .slice(0, 4);
  }, [products, product]);

  if (!product) {
    return (
      <main className="product-not-found">
        <h2>Product Not Found</h2>
        <Link to="/shop">Back to Shop</Link>
      </main>
    );
  }

  // Gallery: use product.images when present, else the single image.
  const gallery =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : [product.image];

  const stock =
    product.stock === undefined ? DEFAULT_STOCK : Number(product.stock);
  const inCart =
    cart.find((item) => String(item.id) === String(product.id))?.quantity ||
    0;
  const remaining = Math.max(0, stock - inCart);
  const outOfStock = stock <= 0;
  const maxSelectable = Math.max(1, remaining);

  const increaseQuantity = () => {
    setQuantity((current) => Math.min(maxSelectable, current + 1));
  };

  const decreaseQuantity = () => {
    setQuantity((current) => Math.max(1, current - 1));
  };

  const handleAddToCart = () => {
    if (buttonState !== "idle" || outOfStock) return;

    const result = addToCart(product, quantity);

    if (result.added === 0) {
      toast.error(`You already have all ${stock} available in your cart.`);
      return;
    }

    if (result.limited) {
      toast.info(`Only ${result.added} could be added - that's all we have.`);
    }

    setLastAdded(result.added);
    setShowToast(true);
    setButtonState("adding");
    setQuantity(1);

    window.setTimeout(() => setButtonState("added"), 350);
    window.setTimeout(() => setButtonState("idle"), 1300);
  };

  const getButtonText = () => {
    if (outOfStock) return "Out of Stock";
    if (remaining === 0) return "All in your cart";
    if (buttonState === "adding") return "Adding...";
    if (buttonState === "added") return "Added ✓";
    return "Add to Cart";
  };

  const rating = Math.min(5, Math.max(0, Math.round(product.rating || 5)));

  return (
    <>
      <main className="product-details-page">
        <div className="product-breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/shop">Shop</Link>
          <span>/</span>
          <span>{product.name}</span>
        </div>

        <section className="product-details-container">
          <div className="product-image-section">
            <div className="product-image-wrapper">
              <img
                src={gallery[activeImage] || product.image}
                alt={product.name}
                className="product-detail-image"
                decoding="async"
              />
            </div>

            {gallery.length > 1 && (
              <div className="product-thumbs">
                {gallery.map((src, index) => (
                  <button
                    type="button"
                    key={src + index}
                    className={`product-thumb ${
                      index === activeImage ? "is-active" : ""
                    }`}
                    onClick={() => setActiveImage(index)}
                    aria-label={`Show image ${index + 1}`}
                  >
                    <img src={src} alt="" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="product-info-section">
            <p className="product-category">{product.category}</p>

            <div className="product-title-row">
              <h1 className="product-detail-title">{product.name}</h1>
              <WishlistButton product={product} />
            </div>

            <div className="product-rating">
              <span className="stars">
                {"★".repeat(rating)}
                {"☆".repeat(5 - rating)}
              </span>
              <span className="rating-number">{product.rating || 5}</span>
            </div>

            <p className="product-detail-price">
              {formatPrice(product.price)}
            </p>

            <p
              className={`stock-status ${
                outOfStock
                  ? "stock-out"
                  : stock <= 3
                  ? "stock-low"
                  : "stock-in"
              }`}
            >
              {outOfStock
                ? "Currently out of stock"
                : stock <= 3
                ? `Only ${stock} left - order soon`
                : "In stock"}
            </p>

            <p className="product-detail-description">
              {product.description}
            </p>

            {!outOfStock && (
              <div className="quantity-section">
                <label>Quantity</label>

                <div className="quantity-control">
                  <button
                    type="button"
                    onClick={decreaseQuantity}
                    aria-label="Decrease quantity"
                    disabled={quantity <= 1}
                  >
                    −
                  </button>
                  <span>{quantity}</span>
                  <button
                    type="button"
                    onClick={increaseQuantity}
                    aria-label="Increase quantity"
                    disabled={quantity >= maxSelectable}
                  >
                    +
                  </button>
                </div>

                {inCart > 0 && (
                  <p className="quantity-note">
                    {inCart} already in your cart
                  </p>
                )}
              </div>
            )}

            <button
              type="button"
              className={`product-add-cart ${
                buttonState === "adding" ? "is-adding" : ""
              } ${buttonState === "added" ? "is-added" : ""}`}
              onClick={handleAddToCart}
              disabled={
                buttonState !== "idle" || outOfStock || remaining === 0
              }
            >
              {getButtonText()}
            </button>

            <div className="product-extra-info">
              <div className="product-info-item">
                <div className="product-info-icon">✦</div>
                <div>
                  <h3>Handmade</h3>
                  <p>Carefully crafted with attention to detail.</p>
                </div>
              </div>

              <div className="product-info-item">
                <div className="product-info-icon">♡</div>
                <div>
                  <h3>Packaging</h3>
                  <p>Prepared carefully for safe delivery.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {related.length > 0 && (
          <section className="related-products">
            <h2>You may also like</h2>

            <div className="product-grid">
              {related.map((item) => (
                <ProductCard product={item} key={item.id} />
              ))}
            </div>
          </section>
        )}
      </main>

      <CartFeedback
        product={product}
        quantity={lastAdded}
        visible={showToast}
        onClose={() => setShowToast(false)}
      />
    </>
  );
};

export default ProductDetails;
