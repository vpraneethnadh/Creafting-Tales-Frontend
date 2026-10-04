import { Link } from "react-router-dom";
import { useProducts } from "../../context/ProductsContext";
import { formatPrice } from "../../utils/helpers";

// Lists the products in an order. Images are looked up from the LIVE
// catalogue so they never break after a redeploy (bundled image URLs
// change on every build).
const OrderItems = ({ items = [] }) => {
  const { allProducts } = useProducts();

  return (
    <ul className="order-items">
      {items.map((item, index) => {
        const live = allProducts.find(
          (p) => String(p.id) === String(item.id)
        );
        const image = live?.image || item.image;

        return (
          <li className="order-item" key={`${item.id}-${index}`}>
            <div className="order-item-image">
              {image ? (
                <img src={image} alt={item.name} loading="lazy" />
              ) : (
                <span>🌸</span>
              )}
            </div>

            <div className="order-item-info">
              {live ? (
                <Link to={`/product/${live.id}`}>{item.name}</Link>
              ) : (
                <span>{item.name}</span>
              )}
              <p>
                {formatPrice(item.price)} × {item.quantity}
              </p>
            </div>

            <strong>{formatPrice(item.price * item.quantity)}</strong>
          </li>
        );
      })}
    </ul>
  );
};

export default OrderItems;
