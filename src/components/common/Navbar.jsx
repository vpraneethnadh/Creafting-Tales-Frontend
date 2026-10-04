import { NavLink } from "react-router-dom";
import { useCart } from "../../hooks/useCart";
import { useAuth } from "../../context/AuthContext";
import { useWishlist } from "../../context/WishlistContext";
import image from "../../assets/images/Logo/Logo.png";
import "./Navbar.css";

const linkClass =
  (extra = "") =>
  ({ isActive }) =>
    `nav-link ${extra} ${isActive ? "active" : ""}`.replace(/\s+/g, " ").trim();

const Navbar = () => {
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { user, isAdmin } = useAuth();

  return (
    <header className="navbar">
      <div className="navbar-inner">

        <NavLink to="/" className="brand">
          <img
            src={image}
            alt="Crafting Tales"
            className="brand-logo"
          />
        </NavLink>

        <nav className="nav-links" aria-label="Main navigation">

          <NavLink to="/" end className={linkClass()}>
            Home
          </NavLink>

          <NavLink to="/shop" className={linkClass()}>
            Shop
          </NavLink>

          <NavLink to="/about" className={linkClass()}>
            About
          </NavLink>

          <NavLink to="/contact" className={linkClass()}>
            Contact
          </NavLink>

          <NavLink
            to="/wishlist"
            className={linkClass("wishlist-link")}
            aria-label={`Wishlist, ${wishlistCount} items`}
          >
            <span aria-hidden="true">♡</span>
            <span className="wishlist-link-text">Wishlist</span>

            {wishlistCount > 0 && (
              <span className="cart-count">{wishlistCount}</span>
            )}
          </NavLink>

          <NavLink to="/cart" className={linkClass("cart-link")}>
            Cart

            {cartCount > 0 && (
              <span className="cart-count">{cartCount}</span>
            )}
          </NavLink>

          {isAdmin && (
            <NavLink to="/admin" className={linkClass("admin-link")}>
              Admin
            </NavLink>
          )}

          {user ? (
            <NavLink to="/profile" className={linkClass("profile-link")}>
              <span className="profile-image-wrapper">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="Profile"
                    className="navbar-profile-image"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="navbar-profile-icon">👤</span>
                )}
              </span>

              <span className="profile-text">Profile</span>
            </NavLink>
          ) : (
            <NavLink to="/login" className={linkClass("login-link")}>
              Login
            </NavLink>
          )}

        </nav>
      </div>
    </header>
  );
};

export default Navbar;
