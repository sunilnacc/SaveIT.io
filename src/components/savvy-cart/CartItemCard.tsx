
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
    <div className="flex items-center justify-between p-4 hover:bg-muted/10 transition-colors border-b border-border/50">
      <div className="flex items-start gap-4 min-w-0 flex-1">
        <div className="relative flex-shrink-0 w-20 h-20 bg-white rounded-md border border-border overflow-hidden">
          <Image
            src={item.images?.[0] || placeholderImage}
            alt={item.name}
            fill
            className="object-contain p-1.5"
            sizes="80px"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              if (target.src !== placeholderImage) {
                target.src = placeholderImage;
              }
            }}
          />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="font-medium text-sm leading-tight line-clamp-2 text-foreground">
            {item.name}
          </h4>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
            {item.brand} • {item.quantity}
          </p>
          <div className="flex items-center justify-between mt-2">
            <p className="text-base font-bold text-primary">
              ₹{(Number(displayPrice) * item.cartQuantity).toFixed(2)}
            </p>
            <p className="text-xs font-medium text-muted-foreground bg-muted/50 px-2 py-1 rounded-md">
              {item.platform.name}
            </p>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1.5 ml-3">
        <Button 
          variant="outline" 
          size="icon" 
          className="h-9 w-9 text-muted-foreground hover:text-foreground"
          onClick={() => handleQuantityChange(false)} 
          disabled={item.cartQuantity <= 1}
        >
          <MinusCircle className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium w-6 text-center text-foreground">
          {item.cartQuantity}
        </span>
        <Button 
          variant="outline" 
          size="icon" 
          className="h-9 w-9 text-muted-foreground hover:text-foreground"
          onClick={() => handleQuantityChange(true)}
        >
          <PlusCircle className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          className="h-9 w-9 text-destructive/80 hover:text-destructive hover:bg-destructive/10"
          onClick={() => onRemoveItem(String(item.id), item.platform.name)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default CartItemCard;
