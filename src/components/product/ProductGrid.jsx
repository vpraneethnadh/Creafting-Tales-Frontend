import ProductCard from "./ProductCard";

const ProductGrid = ({
  products,
  emptyTitle = "No products found",
  emptyText = "Try changing your filters or searching for something else.",
}) => {
  if (!products.length) {
    return (
      <div className="empty-products">
        <h3>{emptyTitle}</h3>
        <p>{emptyText}</p>
      </div>
    );
  }

  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard product={product} key={product.id} />
      ))}
    </div>
  );
};

export default ProductGrid;
