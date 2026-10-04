import { Link } from "react-router-dom";
import { useWishlist } from "../context/WishlistContext";
import { useProducts } from "../context/ProductsContext";
import { useCart } from "../hooks/useCart";
import { useToast } from "../context/ToastContext";
import WishlistButton from "../components/product/WishlistButton";
import { formatPrice } from "../utils/helpers";

const Wishlist = () => {
  const { wishlistIds, removeFromWishlist } = useWishlist();
  const { products } = useProducts();
  const { addToCart } = useCart();
  const toast = useToast();

  const items = wishlistIds
    .map((id) => products.find((p) => String(p.id) === String(id)))
    .filter(Boolean);

  const moveToCart = async (product) => {
    const result = addToCart(product, 1);

    if (result.added === 0) {
      toast.error("That item is out of stock or already maxed out in your cart.");
      return;
    }

    await removeFromWishlist(product.id);
    toast.success("Moved to your cart");
  };

  if (items.length === 0) {
    return (
      <main className="simple-page">
        <section className="empty-cart">
          <p className="eyebrow">YOUR FAVOURITES</p>

          <h1>Wishlist</h1>

          <p>Your favourite handmade creations will appear here.</p>

          <Link to="/shop" className="btn btn-primary">
            Explore Collection
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="wishlist-page">
      <section className="wishlist-header">
        <p className="eyebrow">YOUR FAVOURITES</p>
        <h1>Wishlist</h1>
        <p>
          {items.length} saved item{items.length > 1 ? "s" : ""}
        </p>
      </section>

      <div className="wishlist-grid">
        {items.map((product) => {
          const outOfStock = product.stock <= 0;

          return (
            <article className="wishlist-card" key={product.id}>
              <Link
                to={`/product/${product.id}`}
                className="wishlist-card-image"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  loading="lazy"
                />
              </Link>

              <WishlistButton product={product} className="wishlist-on-card" />

              <div className="wishlist-card-body">
                <p className="wishlist-card-category">{product.category}</p>

                <Link to={`/product/${product.id}`}>
                  <h3>{product.name}</h3>
                </Link>

                <p className="wishlist-card-price">
                  {formatPrice(product.price)}
                </p>

                <button
                  type="button"
                  className="wishlist-move"
                  onClick={() => moveToCart(product)}
                  disabled={outOfStock}
                >
                  {outOfStock ? "Out of Stock" : "Move to Cart"}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </main>
  );
};

export default Wishlist;
