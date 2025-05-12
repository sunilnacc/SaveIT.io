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
    if (newQuantity >= 0) {
      onUpdateQuantity(item.id.toString(), item.platform.name, newQuantity);
    }
  };
  const displayPrice = item.offer_price || item.mrp;

  return (
    <div className="flex items-center justify-between p-3 border-b border-border hover:bg-card/50 transition-colors">
      <div className="flex items-center gap-3">
        <Image
          src={item.images?.[0] || `https://picsum.photos/100/100?grayscale&random=${item.id}`}
          alt={item.name}
          width={60}
          height={60}
          className="rounded-md object-contain border border-border"
          data-ai-hint="product thumbnail"
        />
        <div>
          <h4 className="font-semibold text-sm leading-tight">{item.name}</h4>
          <p className="text-xs text-muted-foreground">{item.brand} - {item.quantity}</p>
          <p className="text-xs text-muted-foreground">From: {item.platform.name}</p>
          <p className="text-sm font-medium text-primary">₹{Number(displayPrice) * item.cartQuantity}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => handleQuantityChange(false)} disabled={item.cartQuantity <= 1}>
          <MinusCircle className="h-5 w-5" />
        </Button>
        <span className="text-sm font-medium w-6 text-center">{item.cartQuantity}</span>
        <Button variant="ghost" size="icon" onClick={() => handleQuantityChange(true)}>
          <PlusCircle className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onRemoveItem(item.id.toString(), item.platform.name)} className="text-destructive hover:text-destructive/80">
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
