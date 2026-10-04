import { useWishlist } from "../../context/WishlistContext";

const WishlistButton = ({ product, className = "" }) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const active = isInWishlist(product.id);

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <button
      type="button"
      className={`wishlist-button ${active ? "is-active" : ""} ${className}`}
      onClick={handleClick}
      aria-pressed={active}
      aria-label={
        active
          ? `Remove ${product.name} from wishlist`
          : `Add ${product.name} to wishlist`
      }
    >
      {active ? "♥" : "♡"}
    </button>
  );
};

export default WishlistButton;
