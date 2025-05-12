import React from 'react';
import type { CartItem } from '@/lib/types';
import CartItemCard from './CartItemCard';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ShoppingBag, BarChart2 } from 'lucide-react';

interface CartPanelProps {
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, platformName: string, newQuantity: number) => void;
  onRemoveItem: (productId: string, platformName: string) => void;
  onCompareCart: () => void;
  isComparing: boolean;
}

const CartPanel: React.FC<CartPanelProps> = ({ cartItems, onUpdateQuantity, onRemoveItem, onCompareCart, isComparing }) => {
  const totalAmount = cartItems.reduce((sum, item) => {
    const price = Number(item.offer_price || item.mrp);
    return sum + price * item.cartQuantity;
  }, 0);

  return (
    <div className="bg-card border border-border rounded-lg shadow-xl flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <h3 className="text-xl font-semibold flex items-center">
          <ShoppingBag className="mr-2 h-6 w-6 text-primary" />
          Your Cart
        </h3>
      </div>

      {cartItems.length === 0 ? (
        <div className="flex-grow flex flex-col items-center justify-center p-4 text-center">
          <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Your cart is empty.</p>
          <p className="text-sm text-muted-foreground">Add products to start comparing!</p>
        </div>
      ) : (
        <ScrollArea className="flex-grow max-h-[calc(100vh-300px)] md:max-h-[400px]">
          <div className="divide-y divide-border">
            {cartItems.map((item) => (
              <CartItemCard
                key={`${item.id}-${item.platform.name}`}
                item={item}
                onUpdateQuantity={onUpdateQuantity}
                onRemoveItem={onRemoveItem}
              />
            ))}
          </div>
        </ScrollArea>
      )}

      {cartItems.length > 0 && (
        <div className="p-4 border-t border-border mt-auto">
          <div className="flex justify-between items-center mb-3">
            <span className="text-lg font-medium">Total:</span>
            <span className="text-2xl font-bold text-primary">₹{totalAmount.toFixed(2)}</span>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Note: Platform fees, delivery charges, and minimum order values are not yet included.
          </p>
          <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" size="lg" onClick={onCompareCart} disabled={isComparing}>
            <BarChart2 className="mr-2 h-5 w-5" />
            {isComparing ? 'Comparing...' : 'Find Best Prices'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default CartPanel;
