import { useState } from "react";
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

  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">

        {/* ================= LOGO ================= */}
        <NavLink to="/" className="brand" onClick={closeMenu}>
          <img
            src={image}
            alt="Crafting Tales"
            className="brand-logo"
          />
        </NavLink>

        {/* ================= DESKTOP NAVIGATION ================= */}
        <nav className="nav-links desktop-nav" aria-label="Main navigation">

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
            <span className="wishlist-heart">♡</span>
            <span>Wishlist</span>

            {wishlistCount > 0 && (
              <span className="cart-count">
                {wishlistCount}
              </span>
            )}
          </NavLink>

          <NavLink
            to="/cart"
            className={linkClass("cart-link")}
          >
            Cart

            {cartCount > 0 && (
              <span className="cart-count">
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

        </nav>

        {/* ================= MOBILE ACTIONS ================= */}
        <div className="mobile-actions">

          {/* Wishlist */}
          <NavLink
            to="/wishlist"
            className="mobile-icon-link"
            aria-label="Wishlist"
          >
            <span className="mobile-heart">♡</span>

            {wishlistCount > 0 && (
              <span className="mobile-count">
                {wishlistCount}
              </span>
            )}
          </NavLink>

          {/* Cart */}
          <NavLink
            to="/cart"
            className="mobile-icon-link"
            aria-label="Cart"
          >
            <span className="mobile-cart-icon">
              🛒
            </span>

            {cartCount > 0 && (
              <span className="mobile-count">
                {cartCount}
              </span>
            )}
          </NavLink>

          {/* Hamburger */}
          <button
            type="button"
            className={`menu-button ${menuOpen ? "open" : ""}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

        </div>
      </div>

      {/* ================= MOBILE MENU ================= */}
      <div className={`mobile-menu ${menuOpen ? "show" : ""}`}>

        <NavLink
          to="/"
          end
          className={linkClass("mobile-nav-link")}
          onClick={closeMenu}
        >
          Home
        </NavLink>

        <NavLink
          to="/shop"
          className={linkClass("mobile-nav-link")}
          onClick={closeMenu}
        >
          Shop
        </NavLink>

        <NavLink
          to="/about"
          className={linkClass("mobile-nav-link")}
          onClick={closeMenu}
        >
          About
        </NavLink>

        <NavLink
          to="/contact"
          className={linkClass("mobile-nav-link")}
          onClick={closeMenu}
        >
          Contact
        </NavLink>

        <NavLink
          to="/wishlist"
          className={linkClass("mobile-nav-link")}
          onClick={closeMenu}
        >
          <span>♡ Wishlist</span>

          {wishlistCount > 0 && (
            <span className="menu-count">
              {wishlistCount}
            </span>
          )}
        </NavLink>

        <NavLink
          to="/cart"
          className={linkClass("mobile-nav-link")}
          onClick={closeMenu}
        >
          <span>🛒 Cart</span>

          {cartCount > 0 && (
            <span className="menu-count">
              {cartCount}
            </span>
          )}
        </NavLink>

        {isAdmin && (
          <NavLink
            to="/admin"
            className={linkClass("mobile-nav-link")}
            onClick={closeMenu}
          >
            Admin
          </NavLink>
        )}

        {user ? (
          <NavLink
            to="/profile"
            className={linkClass("mobile-nav-link")}
            onClick={closeMenu}
          >
            <span className="mobile-profile">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="Profile"
                  className="mobile-profile-image"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span>👤</span>
              )}

              <span>Profile</span>
            </span>
          </NavLink>
        ) : (
          <NavLink
            to="/login"
            className={linkClass("mobile-nav-link mobile-login")}
            onClick={closeMenu}
          >
            Login
          </NavLink>
        )}

      </div>
    </header>
  );
};

export default Navbar;
