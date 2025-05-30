import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { CardHoverEffect, Card, CardTitle } from '@/components/ui/card-hover-effect';
import type { Product } from '@/lib/types';
import { ShoppingCart, ExternalLink } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const displayPrice = product.offer_price || product.mrp;
  const hasDiscount = product.offer_price && product.mrp && parseFloat(String(product.offer_price)) < parseFloat(String(product.mrp));
  const placeholderImage = `https://placehold.co/300x300.png`;

  return (
    <CardHoverEffect className="h-full">
      <Card className="flex flex-col h-full p-4">
        <div className="relative w-full aspect-square mb-3">
          <Image
            src={product.images?.[0] || placeholderImage}
            alt={product.name}
            fill
            style={{ objectFit: 'contain' }}
            className="rounded-md"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              if (target.src !== placeholderImage) {
                target.src = placeholderImage;
              }
            }}
          />
          {product.platform.icon && (
            <div className="absolute top-2 right-2 bg-background/80 p-1.5 rounded-full border shadow-sm">
              <Image
                src={product.platform.icon}
                alt={product.platform.name}
                width={24}
                height={24}
                className="w-5 h-5 object-contain"
                data-ai-hint={`${product.platform.name} logo`}
              />
            </div>
          )}
        </div>
        <CardTitle className="text-base font-semibold leading-tight line-clamp-2 h-[2.5rem] mb-1">
          {product.name}
        </CardTitle>
        <div className="mb-2">
          <p className="text-sm text-muted-foreground line-clamp-1">{product.brand}</p>
          <p className="text-xs text-muted-foreground">{product.quantity}</p>
        </div>
        
        <div className="mt-auto">
          <div className="flex items-baseline justify-between mb-2">
            <div className="flex items-baseline gap-2">
              <p className="text-xl font-bold text-primary">₹{Number(displayPrice).toFixed(2)}</p>
              {hasDiscount && product.mrp && (
                <p className="text-sm text-muted-foreground line-through">₹{Number(product.mrp).toFixed(2)}</p>
              )}
            </div>
          </div>
          
          <p className="text-xs font-medium text-muted-foreground bg-muted/50 px-2 py-1 rounded-md mb-3 text-center">
            {product.platform.name}
          </p>
          
          <div className="grid grid-cols-2 gap-2 w-full">
            <Button 
              variant="outline" 
              size="sm"
              className="h-9 text-sm font-medium gap-2" 
              onClick={(e) => {
                e.preventDefault();
                onAddToCart(product);
              }}
              disabled={!product.available}
            >
              <ShoppingCart className="h-4 w-4" />
              <span>{product.available ? 'Add' : 'Unavailable'}</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              asChild 
              className="h-9 text-sm font-medium gap-2"
            >
              <a href={product.deeplink} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}>
                <ExternalLink className="h-4 w-4" />
                <span>View</span>
              </a>
            </Button>
          </div>
        </div>
      </Card>
    </CardHoverEffect>
  );
};

export default ProductCard;
