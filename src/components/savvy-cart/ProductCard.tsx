import React from 'react';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Product } from '@/lib/types';
import { ShoppingCart, ExternalLink } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const displayPrice = product.offer_price || product.mrp;
  const hasDiscount = product.offer_price && product.offer_price !== product.mrp;

  return (
    <Card className="flex flex-col overflow-hidden h-full shadow-lg hover:shadow-primary/30 transition-shadow duration-300">
      <CardHeader className="p-4">
        <div className="relative w-full h-48 mb-2">
          <Image
            src={product.images?.[0] || 'https://picsum.photos/300/300?random=' + product.id}
            alt={product.name}
            fill
            style={{ objectFit: 'contain' }}
            className="rounded-md"
            data-ai-hint="product grocery"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={(e) => e.currentTarget.src = 'https://picsum.photos/300/300?random=' + product.id}
          />
           {product.platform.icon && (
            <Image
              src={product.platform.icon}
              alt={product.platform.name}
              width={32}
              height={32}
              className="absolute top-2 right-2 bg-background/70 p-1 rounded-full"
              data-ai-hint={`${product.platform.name} logo`}
            />
          )}
        </div>
        <CardTitle className="text-lg leading-tight h-12 overflow-hidden">{product.name}</CardTitle>
        <p className="text-sm text-muted-foreground">{product.brand}</p>
        <p className="text-xs text-muted-foreground">{product.quantity}</p>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-bold text-primary">₹{displayPrice}</p>
          {hasDiscount && (
            <p className="text-sm text-muted-foreground line-through">₹{product.mrp}</p>
          )}
        </div>
        <p className="text-sm text-secondary mt-1">
          Available on: {product.platform.name}
        </p>
      </CardContent>
      <CardFooter className="p-4 grid grid-cols-2 gap-2">
        <Button variant="outline" className="w-full" onClick={() => onAddToCart(product)} disabled={!product.available}>
          <ShoppingCart className="mr-2 h-4 w-4" />
          {product.available ? 'Add to Cart' : 'Unavailable'}
        </Button>
        <Button variant="ghost" asChild className="w-full">
          <a href={product.deeplink} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="mr-2 h-4 w-4" />
            View
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
