
import React from 'react';
import Image from 'next/image';
import type { CartItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { MinusCircle, PlusCircle, Trash2, ExternalLink } from 'lucide-react';

interface CartItemCardProps {
  item: CartItem;
  onUpdateQuantity: (productId: string, platformName: string, newQuantity: number) => void;
  onRemoveItem: (productId: string, platformName: string) => void;
}

const CartItemCard: React.FC<CartItemCardProps> = ({ item, onUpdateQuantity, onRemoveItem }) => {
  const handleQuantityChange = (increment: boolean) => {
    const newQuantity = increment ? item.cartQuantity + 1 : item.cartQuantity - 1;
    // if (newQuantity >= 0) { // Allows quantity to become 0, removal handled by panel
      onUpdateQuantity(String(item.id), item.platform.name, newQuantity);
    // }
  };
  const displayPrice = item.offer_price || item.mrp;
  const placeholderImage = `https://placehold.co/100x100.png`;

  return (
    <div className="flex items-center justify-between p-3 border-b border-border hover:bg-muted/30 transition-colors">
      <div className="flex items-center gap-3">
        <Image
          src={item.images?.[0] || placeholderImage}
          alt={item.name}
          width={60}
          height={60}
          className="rounded-md object-contain border border-border bg-white"
          data-ai-hint="product thumbnail"
           onError={(e) => {
              const target = e.target as HTMLImageElement;
              if (target.src !== placeholderImage) {
                target.src = placeholderImage;
              }
            }}
        />
        <div>
          <h4 className="font-semibold text-sm leading-tight">{item.name}</h4>
          <p className="text-xs text-muted-foreground">{item.brand} - {item.quantity}</p>
          <p className="text-xs text-muted-foreground">From: {item.platform.name}</p>
          <p className="text-sm font-medium text-primary">₹{(Number(displayPrice) * item.cartQuantity).toFixed(2)}</p>
        </div>
      </div>
      <div className="flex items-center gap-1 sm:gap-2">
        <Button variant="ghost" size="icon" onClick={() => handleQuantityChange(false)} disabled={item.cartQuantity <= 0}>
          <MinusCircle className="h-5 w-5" />
        </Button>
        <span className="text-sm font-medium w-6 text-center">{item.cartQuantity}</span>
        <Button variant="ghost" size="icon" onClick={() => handleQuantityChange(true)}>
          <PlusCircle className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onRemoveItem(String(item.id), item.platform.name)} className="text-destructive hover:text-destructive/80">
          <Trash2 className="h-5 w-5" />
        </Button>
         <Button variant="ghost" size="icon" asChild>
          <a href={item.deeplink} target="_blank" rel="noopener noreferrer" title={`View on ${item.platform.name}`}>
            <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
      </div>
    </div>
  );
};

export default CartItemCard;
