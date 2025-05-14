
import React from 'react';
import type { CartItem, PlatformCostDetails } from '@/lib/types';
import CartItemCard from './CartItemCard';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ShoppingBag, BarChart2, AlertTriangle } from 'lucide-react';

interface CartPanelProps {
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, platformName: string, newQuantity: number) => void;
  onRemoveItem: (productId: string, platformName: string) => void;
  onCompareCart: () => void;
  isComparing: boolean;
  platformCostConfig: Record<string, PlatformCostDetails>; // Receive platform costs
}

const CartPanel: React.FC<CartPanelProps> = ({ cartItems, onUpdateQuantity, onRemoveItem, onCompareCart, isComparing, platformCostConfig }) => {
  
  const getCartSubtotalByPlatform = () => {
    const platformTotals: Record<string, number> = {};
    cartItems.forEach(item => {
      const price = Number(item.offer_price || item.mrp);
      platformTotals[item.platform.name] = (platformTotals[item.platform.name] || 0) + (price * item.cartQuantity);
    });
    return platformTotals;
  };

  const calculateCartSummary = () => {
    let itemsTotal = 0;
    let estimatedDeliveryFees = 0;
    let estimatedPlatformFees = 0;
    const platformsInCart = new Set<string>();

    cartItems.forEach(item => {
      const price = Number(item.offer_price || item.mrp);
      itemsTotal += price * item.cartQuantity;
      platformsInCart.add(item.platform.name);
    });

    // For simplicity, sum fees if items are from multiple platforms
    // A more advanced logic could optimize this (e.g. if all items can be on one platform)
    platformsInCart.forEach(platformName => {
      const config = platformCostConfig[platformName] || platformCostConfig['default'];
      estimatedDeliveryFees += config.deliveryFee || 0;
      estimatedPlatformFees += config.platformFee || 0;
    });
    
    // If only one platform, use its fees directly. This is a simplification.
    if (platformsInCart.size === 1) {
        const platformName = Array.from(platformsInCart)[0];
        const config = platformCostConfig[platformName] || platformCostConfig['default'];
        estimatedDeliveryFees = config.deliveryFee || 0;
        estimatedPlatformFees = config.platformFee || 0;
    }


    const grandTotal = itemsTotal + estimatedDeliveryFees + estimatedPlatformFees;
    return { itemsTotal, estimatedDeliveryFees, estimatedPlatformFees, grandTotal, platformsInCart };
  };

  const { itemsTotal, estimatedDeliveryFees, estimatedPlatformFees, grandTotal, platformsInCart } = calculateCartSummary();
  const platformSubtotals = getCartSubtotalByPlatform();

  const getMOVAlerts = () => {
    const alerts: { platformName: string, subtotal: number, mov: number }[] = [];
    Object.entries(platformSubtotals).forEach(([platformName, subtotal]) => {
      const config = platformCostConfig[platformName] || platformCostConfig['default'];
      if (config.minOrderValue && subtotal < config.minOrderValue) {
        alerts.push({ platformName, subtotal, mov: config.minOrderValue });
      }
    });
    return alerts;
  };
  const movAlerts = getMOVAlerts();

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
        <ScrollArea className="flex-grow max-h-[calc(100vh-420px)] md:max-h-[300px]"> {/* Adjusted height */}
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
          <div className="space-y-1 mb-3 text-sm">
            <div className="flex justify-between">
              <span>Items Total:</span>
              <span>₹{itemsTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Est. Delivery Fees:</span>
              <span className="text-muted-foreground">₹{estimatedDeliveryFees.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Est. Platform Fees:</span>
              <span className="text-muted-foreground">₹{estimatedPlatformFees.toFixed(2)}</span>
            </div>
          </div>
          <div className="flex justify-between items-center mb-3 border-t pt-3 mt-2">
            <span className="text-lg font-medium">Estimated Total:</span>
            <span className="text-2xl font-bold text-primary">₹{grandTotal.toFixed(2)}</span>
          </div>
          
          {movAlerts.length > 0 && (
            <div className="mb-3 space-y-1">
              {movAlerts.map(alert => (
                <div key={alert.platformName} className="text-xs text-amber-600 dark:text-amber-400 p-2 rounded-md bg-amber-500/10 border border-amber-500/30 flex items-start">
                  <AlertTriangle className="h-4 w-4 mr-2 shrink-0 mt-0.5" />
                  <span>Subtotal for {alert.platformName} (₹{alert.subtotal.toFixed(2)}) is below their typical ₹{alert.mov} minimum. You might incur extra fees or need to add more items on {alert.platformName}.</span>
                </div>
              ))}
            </div>
          )}

          <p className="text-xs text-muted-foreground mb-3">
            Note: Fees are estimates. Discounts & final charges applied by platforms at checkout.
          </p>
          <Button 
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" 
            size="lg" 
            onClick={onCompareCart} 
            disabled={isComparing || cartItems.length === 0}
          >
            <BarChart2 className="mr-2 h-5 w-5" />
            {isComparing ? 'Comparing...' : 'Find Best Prices'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default CartPanel;
