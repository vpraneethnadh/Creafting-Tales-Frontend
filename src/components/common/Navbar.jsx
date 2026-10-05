import { NavLink } from "react-router-dom";
import { useCart } from "../../hooks/useCart";
import { useAuth } from "../../context/AuthContext";
import { useWishlist } from "../../context/WishlistContext";
import image from "../../assets/images/Logo/Logo.png";
import "./Navbar.css";

const linkClass = (extra = "") => ({ isActive }) =>
  `nav-link ${extra} ${isActive ? "active" : ""}`
    .replace(/\s+/g, " ")
    .trim();

const Navbar = () => {
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { user, isAdmin } = useAuth();

  return (
    <header className="navbar">
      <div className="navbar-inner">

        {/* LOGO */}
        <NavLink
          to="/"
          className="brand"
          aria-label="Crafting Tales"
        >
          <img
            src={image}
            alt="Crafting Tales"
            className="brand-logo"
          />
        </NavLink>

        {/* MAIN NAVIGATION */}
        <nav
          className="nav-links"
          aria-label="Main navigation"
        >
          <NavLink
            to="/"
            end
            className={linkClass()}
          >
            Home
          </NavLink>

          <NavLink
            to="/shop"
            className={linkClass()}
          >
            Shop
          </NavLink>

          <NavLink
            to="/about"
            className={linkClass()}
          >
            About
          </NavLink>

          <NavLink
            to="/contact"
            className={linkClass()}
          >
            Contact
          </NavLink>
        </nav>

        {/* SHOPPING / ACCOUNT ACTIONS */}
        <div className="nav-actions">

          <NavLink
            to="/wishlist"
            className={linkClass("wishlist-link")}
            aria-label={`Wishlist, ${wishlistCount} items`}
          >
            <span className="wishlist-symbol">♡</span>
            <span>Wishlist</span>

            {wishlistCount > 0 && (
              <span className="nav-count">
                {wishlistCount}
              </span>
            )}
          </NavLink>

          <NavLink
            to="/cart"
            className={linkClass("cart-link")}
            aria-label={`Cart, ${cartCount} items`}
          >
            <span>Cart</span>

            {cartCount > 0 && (
              <span className="nav-count">
                {cartCount}
              </span>
            )}
          </NavLink>

          {isAdmin && (
            <NavLink
              to="/admin"
              className={linkClass("admin-link")}
            >
              Admin
            </NavLink>
          )}

          {user ? (
            <NavLink
              to="/profile"
              className={linkClass("profile-link")}
              aria-label="Profile"
            >
              <span className="profile-image-wrapper">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="Profile"
                    className="navbar-profile-image"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="navbar-profile-icon">
                    👤
                  </span>
                )}
              </span>

              <span className="profile-text">
                Profile
              </span>
            </NavLink>
          ) : (
            <NavLink
              to="/login"
              className={linkClass("login-link")}
            >
              Login
            </NavLink>
          )}

        </div>
      </div>
    </header>
  );
};

export default Navbar;
