import { useProducts } from "../../context/ProductsContext";
import ProductGrid from "../product/ProductGrid";

const FeaturedProducts = () => {
  const { products } = useProducts();

  const featured = products.filter((product) => product.featured);

  return (
    <section className="featured-section">
      <div className="section-heading">
        <p className="eyebrow">OUR FAVOURITES</p>

        <h2>Featured Creations</h2>

        <p>Some of our most loved handmade pieces.</p>
      </div>

      <ProductGrid products={featured} />
    </section>
  );
};

export default FeaturedProducts;
