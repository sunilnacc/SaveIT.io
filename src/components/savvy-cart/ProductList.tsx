import React from 'react';
import type { Product } from '@/lib/types';
import ProductCard from './ProductCard';

interface ProductListProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
}

const ProductList: React.FC<ProductListProps> = ({ products, onAddToCart }) => {
  if (products.length === 0) {
    return <p className="text-center text-muted-foreground py-8">No products found. Try a different search term!</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
      {products.map((product) => (
        <ProductCard key={`${product.id}-${product.platform.name}`} product={product} onAddToCart={onAddToCart} />
      ))}
    </div>
  );
};

export default ProductList;
