import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useProducts } from "../context/ProductsContext";
import ProductGrid from "../components/product/ProductGrid";
import { formatPrice, toDate } from "../utils/helpers";
import "./Shop.css";

const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low → High" },
  { value: "price-desc", label: "Price: High → Low" },
];

const newestScore = (product) => {
  // Products added from the admin panel carry a createdAt timestamp.
  const created = toDate(product.createdAt);
  if (created) return created.getTime();
  return Number(product.id) || 0;
};

const Shop = () => {
  const { products, categories, loading } = useProducts();
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedCategory = searchParams.get("category") || "All";
  const search = searchParams.get("q") || "";
  const sort = searchParams.get("sort") || "featured";

  const priceCeiling = useMemo(
    () =>
      Math.max(
        100,
        Math.ceil(Math.max(...products.map((p) => p.price), 0) / 50) * 50
      ),
    [products]
  );

  const maxPrice = Number(searchParams.get("max")) || priceCeiling;

  // Typing in the search box shouldn't hit the URL on every key press.
  const [searchText, setSearchText] = useState(search);

  useEffect(() => {
    setSearchText(search);
  }, [search]);

  const updateParams = (changes) => {
    // Functional form so a delayed update never overwrites newer filters.
    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous);

        Object.entries(changes).forEach(([key, value]) => {
          if (value === "" || value === null || value === undefined) {
            next.delete(key);
          } else {
            next.set(key, value);
          }
        });

        return next;
      },
      { replace: true }
    );
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (searchText.trim() !== search) {
        updateParams({ q: searchText.trim() });
      }
    }, 250);

    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText]);

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();

    const list = products.filter((product) => {
      if (
        selectedCategory !== "All" &&
        product.category.toLowerCase() !== selectedCategory.toLowerCase()
      ) {
        return false;
      }

      if (product.price > maxPrice) return false;

      if (term) {
        const haystack = `${product.name} ${product.category} ${
          product.description || ""
        }`.toLowerCase();
        return term.split(/\s+/).every((word) => haystack.includes(word));
      }

      return true;
    });

    const sorted = [...list];

    if (sort === "price-asc") {
      sorted.sort((a, b) => a.price - b.price);
    } else if (sort === "price-desc") {
      sorted.sort((a, b) => b.price - a.price);
    } else if (sort === "newest") {
      sorted.sort((a, b) => newestScore(b) - newestScore(a));
    } else {
      // Featured first, otherwise original order
      sorted.sort((a, b) => Number(!!b.featured) - Number(!!a.featured));
    }

    return sorted;
  }, [products, selectedCategory, search, maxPrice, sort]);

  const filtersActive =
    selectedCategory !== "All" ||
    search !== "" ||
    maxPrice < priceCeiling ||
    sort !== "featured";

  const clearFilters = () => {
    setSearchText("");
    setSearchParams({}, { replace: true });
  };

  const changeCategory = (category) => {
    updateParams({ category: category === "All" ? "" : category });
  };

  return (
    <main className="shop-page">

      {/* SHOP HEADER */}
      <section className="shop-header">
        <p className="eyebrow">OUR COLLECTION</p>

        <h1>Shop</h1>

        <p>
          Explore our handmade creations, thoughtfully crafted
          to bring colour and joy to every occasion.
        </p>
      </section>

      {/* SEARCH + SORT + PRICE */}
      <section className="shop-toolbar" aria-label="Search and filters">

        <div className="shop-search">
          <input
            type="search"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search flowers, keychains, bouquets..."
            aria-label="Search products"
          />
        </div>

        <label className="shop-control">
          <span>Sort by</span>
          <select
            value={sort}
            onChange={(e) =>
              updateParams({ sort: e.target.value === "featured" ? "" : e.target.value })
            }
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="shop-control shop-price">
          <span>
            Up to <strong>{formatPrice(maxPrice)}</strong>
          </span>
          <input
            type="range"
            min="0"
            max={priceCeiling}
            step="50"
            value={Math.min(maxPrice, priceCeiling)}
            onChange={(e) =>
              updateParams({
                max:
                  Number(e.target.value) >= priceCeiling
                    ? ""
                    : e.target.value,
              })
            }
            aria-label="Maximum price"
          />
        </label>

        {filtersActive && (
          <button
            type="button"
            className="shop-clear"
            onClick={clearFilters}
          >
            Clear filters
          </button>
        )}
      </section>

      {/* CATEGORY FILTERS */}
      <section className="shop-categories">

        <button
          className={
            selectedCategory === "All"
              ? "category-filter active"
              : "category-filter"
          }
          onClick={() => changeCategory("All")}
        >
          All
        </button>

        {categories.map((category) => (
          <button
            key={category.id}
            className={
              selectedCategory === category.name
                ? "category-filter active"
                : "category-filter"
            }
            onClick={() => changeCategory(category.name)}
          >
            {category.name}
          </button>
        ))}

      </section>

      {/* PRODUCTS */}
      <section className="shop-results">

        <div className="shop-count">
          {filteredProducts.length}{" "}
          {filteredProducts.length === 1 ? "Product" : "Products"}
          {loading && " · updating..."}
        </div>

        <ProductGrid
          products={filteredProducts}
          emptyText={
            filtersActive
              ? "Nothing matches your filters. Try clearing them."
              : "No products yet. Please check back soon."
          }
        />

        {filtersActive && filteredProducts.length === 0 && (
          <div className="shop-empty-actions">
            <button
              type="button"
              className="shop-clear"
              onClick={clearFilters}
            >
              Clear all filters
            </button>
          </div>
        )}

      </section>

    </main>
  );
};

export default Shop;
