import type { Category, Product } from "@/types";

import ProductCard from "@/components/ProductCard";

interface CategoryListProps {
  category: Category;
  products: Product[];
}

export default function CategoryList({
  category,
  products,
}: CategoryListProps) {
  const visibleProducts = products.slice(0, 5);

  if (visibleProducts.length === 0) {
    return null;
  }

  return (
    <section className="w-full flex flex-col gap-4">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold text-zinc-100">
            {category.name}
          </h2>

          {category.description && (
            <p className="text-sm text-zinc-400 mt-1">
              {category.description}
            </p>
          )}
        </div>

        <span className="text-sm text-zinc-500">
          {visibleProducts.length} produse
        </span>
      </div>

      {/* Lista produse */}
      <div
        className="
          flex
          gap-4
          overflow-x-auto
          pb-2
          snap-x
          snap-mandatory
          scrollbar-thin
          scrollbar-thumb-zinc-700
          scrollbar-track-transparent
        "
      >
        {visibleProducts.map((product) => (
          <ProductCard
            key={product.productId}
            product={product}
          />
        ))}
      </div>
    </section>
  );
}