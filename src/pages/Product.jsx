import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import { useWishlist } from "../context/WishlistContext";
import { products } from "../data/products";

const Product = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();

  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const product = products.find(
    (item) => String(item.id) === String(id)
  );

  if (!product) {
    return (
      <main className="product-page">
        <section className="product-not-found">
          <p className="product-eyebrow">PRODUCT NOT FOUND</p>

          <h1>We couldn't find that creation.</h1>

          <p>
            The product you are looking for may have been removed or
            may no longer be available.
          </p>

          <Link to="/shop" className="product-primary-button">
            Back to Shop
          </Link>
        </section>
      </main>
    );
  }

  const isWishlisted = wishlist?.some(
    (item) => String(item.id) === String(product.id)
  );

  const handleQuantityDecrease = () => {
    setQuantity((current) => Math.max(1, current - 1));
  };

  const handleQuantityIncrease = () => {
    setQuantity((current) => current + 1);
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAdded(true);

    window.setTimeout(() => {
      setAdded(false);
    }, 2000);
  };

  const handleWishlist = () => {
    if (isWishlisted) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  return (
    <main className="product-page">
      <div className="product-container">
        <Link to="/shop" className="product-back-link">
          ← Back to Shop
        </Link>

        <div className="product-details">
          <section className="product-image-section">
            <div className="product-image-wrapper">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="product-main-image"
                />
              ) : (
                <div className="product-image-placeholder">
                  Image unavailable
                </div>
              )}
            </div>
          </section>

          <section className="product-info">
            <p className="product-category">
              {product.category}
            </p>

            <h1>{product.name}</h1>

            <p className="product-price">
              ₹{product.price}
            </p>

            <div className="product-divider" />

            <p className="product-description">
              Discover this beautiful handmade creation from Crafting
              Tales. Each piece is carefully selected to bring
              personality, warmth, and a little something special to
              your everyday moments.
            </p>

            <div className="product-actions">
              <div className="product-quantity">
                <button
                  type="button"
                  onClick={handleQuantityDecrease}
                  aria-label="Decrease quantity"
                >
                  −
                </button>

                <span>{quantity}</span>

                <button
                  type="button"
                  onClick={handleQuantityIncrease}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                className="product-add-button"
                onClick={handleAddToCart}
              >
                {added ? "Added to Cart ✓" : "Add to Cart"}
              </button>

              <button
                type="button"
                className={
                  isWishlisted
                    ? "product-wishlist-button active"
                    : "product-wishlist-button"
                }
                onClick={handleWishlist}
                aria-label={
                  isWishlisted
                    ? "Remove from wishlist"
                    : "Add to wishlist"
                }
              >
                {isWishlisted ? "♥" : "♡"}
              </button>
            </div>

            <div className="product-features">
              <div className="product-feature">
                <span>✿</span>

                <div>
                  <strong>Handmade</strong>
                  <p>Created with care and attention to detail.</p>
                </div>
              </div>

              <div className="product-feature">
                <span>♡</span>

                <div>
                  <strong>Made for gifting</strong>
                  <p>A thoughtful choice for someone special.</p>
                </div>
              </div>

              <div className="product-feature">
                <span>✦</span>

                <div>
                  <strong>Crafting Tales</strong>
                  <p>Unique creations with their own little story.</p>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="product-buy-button"
              onClick={() => {
                addToCart(product, quantity);
                navigate("/cart");
              }}
            >
              Buy Now
            </button>
          </section>
        </div>
      </div>
    </main>
  );
};

export default Product;