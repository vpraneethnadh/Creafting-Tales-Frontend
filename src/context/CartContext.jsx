import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useProducts } from "./ProductsContext";
import { DEFAULT_STOCK } from "../utils/helpers";

export const CartContext = createContext(null);

const STORAGE_KEY = "crafting-tales-cart-v1";

const loadStoredCart = () => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const sameId = (a, b) => String(a) === String(b);

const CartProvider = ({ children }) => {
  const { allProducts } = useProducts();

  // What is saved in the browser: just id + quantity + a display fallback.
  const [stored, setStored] = useState(loadStoredCart);

  // Persist the cart so a refresh no longer empties it.
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    } catch {
      /* storage full / blocked - cart still works in memory */
    }
  }, [stored]);

  // Cart shown to the user = stored items + the LATEST product data, so
  // prices, names, images and stock are never stale.
  const cart = useMemo(
    () =>
      stored.map((item) => {
        const fresh = allProducts.find((p) => sameId(p.id, item.id));
        const merged = fresh
          ? {
              ...item,
              name: fresh.name,
              price: fresh.price,
              image: fresh.image,
              category: fresh.category,
              stock: fresh.stock,
              hidden: !!fresh.hidden,
            }
          : item;

        const stock =
          merged.stock === undefined ? DEFAULT_STOCK : Number(merged.stock);

        return {
          ...merged,
          stock,
          unavailable: merged.hidden || stock <= 0,
          exceedsStock: stock > 0 && merged.quantity > stock,
        };
      }),
    [stored, allProducts]
  );

  const stockFor = (product) =>
    product.stock === undefined || product.stock === null
      ? DEFAULT_STOCK
      : Number(product.stock);

  // =========================================
  // ADD TO CART  -> { added, limited }
  // =========================================
  const addToCart = useCallback(
    (product, quantity = 1) => {
      const max = stockFor(product);
      const existing = stored.find((item) => sameId(item.id, product.id));
      const currentQty = existing ? existing.quantity : 0;

      const allowed = Math.max(0, Math.min(quantity, max - currentQty));

      if (allowed <= 0) {
        return { added: 0, limited: true };
      }

      setStored((current) => {
        const found = current.find((item) => sameId(item.id, product.id));

        if (found) {
          return current.map((item) =>
            sameId(item.id, product.id)
              ? { ...item, quantity: item.quantity + allowed }
              : item
          );
        }

        return [
          ...current,
          {
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            category: product.category,
            stock: max,
            quantity: allowed,
          },
        ];
      });

      return { added: allowed, limited: allowed < quantity };
    },
    [stored]
  );

  const removeFromCart = useCallback((productId) => {
    setStored((current) =>
      current.filter((item) => !sameId(item.id, productId))
    );
  }, []);

  const increaseQuantity = useCallback(
    (productId) => {
      const item = cart.find((i) => sameId(i.id, productId));
      if (!item || item.quantity >= item.stock) return false;

      setStored((current) =>
        current.map((i) =>
          sameId(i.id, productId) ? { ...i, quantity: i.quantity + 1 } : i
        )
      );
      return true;
    },
    [cart]
  );

  const decreaseQuantity = useCallback((productId) => {
    setStored((current) =>
      current
        .map((i) =>
          sameId(i.id, productId) ? { ...i, quantity: i.quantity - 1 } : i
        )
        .filter((i) => i.quantity > 0)
    );
  }, []);

  const updateQuantity = useCallback(
    (productId, quantity) => {
      const item = cart.find((i) => sameId(i.id, productId));
      const max = item ? item.stock : DEFAULT_STOCK;
      const next = Math.min(max, Math.max(0, Number(quantity) || 0));

      setStored((current) =>
        current
          .map((i) =>
            sameId(i.id, productId) ? { ...i, quantity: next } : i
          )
          .filter((i) => i.quantity > 0)
      );
    },
    [cart]
  );

  const clearCart = useCallback(() => setStored([]), []);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  const cartTotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // true when something in the cart can't be bought as-is
  const hasStockIssues = cart.some(
    (item) => item.unavailable || item.exceedsStock
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        cartItems: cart,
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
        hasStockIssues,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
};

export default CartProvider;
export { CartProvider };
