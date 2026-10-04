import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  products as staticProducts,
  categories,
} from "../data/products.js";
import {
  db,
  collection,
  onSnapshot,
} from "../firebase/firebase";
import { DEFAULT_STOCK } from "../utils/helpers";

const ProductsContext = createContext(null);

// Keep only the fields an admin override is allowed to change.
const cleanOverride = (data) => {
  const out = { ...data };
  if (!out.image) delete out.image; // keep the bundled image
  return out;
};

const withDefaults = (product) => ({
  rating: 5,
  featured: false,
  ...product,
  price: Number(product.price) || 0,
  stock:
    product.stock === undefined || product.stock === null
      ? DEFAULT_STOCK
      : Number(product.stock),
});

export const ProductsProvider = ({ children }) => {
  // Firestore `products` collection:
  //   * doc id = String(existing product id)  -> overrides price/stock/etc.
  //   * any other doc id                      -> a brand new product
  const [overrides, setOverrides] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "products"),
      (snapshot) => {
        const next = {};
        snapshot.forEach((d) => {
          next[d.id] = d.data();
        });
        setOverrides(next);
        setLoading(false);
      },
      (error) => {
        // Rules not published yet / offline: the catalogue still works
        // from the bundled data.
        console.warn("Products collection unavailable:", error.code);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  const allProducts = useMemo(() => {
    const staticIds = new Set(staticProducts.map((p) => String(p.id)));

    const base = staticProducts.map((p) => {
      const override = overrides[String(p.id)];
      return withDefaults(
        override ? { ...p, ...cleanOverride(override), id: p.id } : p
      );
    });

    const custom = Object.entries(overrides)
      .filter(([id]) => !staticIds.has(id))
      .map(([id, data]) => withDefaults({ ...data, id, custom: true }));

    return [...base, ...custom];
  }, [overrides]);

  // Storefront never shows hidden products.
  const products = useMemo(
    () => allProducts.filter((p) => !p.hidden),
    [allProducts]
  );

  const value = useMemo(
    () => ({
      products,
      allProducts,
      categories,
      loading,
      getProductById: (id) =>
        products.find((p) => String(p.id) === String(id)),
    }),
    [products, allProducts, loading]
  );

  return (
    <ProductsContext.Provider value={value}>
      {children}
    </ProductsContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductsContext);

  if (!context) {
    throw new Error("useProducts must be used inside ProductsProvider");
  }

  return context;
};
