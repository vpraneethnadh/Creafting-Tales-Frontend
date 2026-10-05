import { Link } from "react-router-dom";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-inner">

        <div className="footer-brand">
          <h2>Crafting Tales</h2>

          <p>
            Handmade chenille creations crafted with love and care.
          </p>
        </div>

        <div className="footer-links">
          <Link to="/shop">Shop</Link>
          <Link to="/about">Our Story</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/wishlist">Wishlist</Link>
          <Link to="/cart">Cart</Link>
          <Link to="/orders">My Orders</Link>
        </div>

      </div>

      <div className="footer-bottom">
        © {new Date().getFullYear()} Crafting Tales. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
