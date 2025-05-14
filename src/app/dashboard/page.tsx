
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Header from '@/components/savvy-cart/Header';
import SearchBar from '@/components/savvy-cart/SearchBar';
import ProductList from '@/components/savvy-cart/ProductList';
import CartPanel from '@/components/savvy-cart/CartPanel';
import SavingsSuggestionsPanel from '@/components/savvy-cart/SavingsSuggestionsPanel';
import ComparisonView from '@/components/savvy-cart/ComparisonView';
import type { Product, CartItem, ApiResponse, SavingsSuggestion, ProductEquivalencyCheckItem, AISavingsCartItem, ComparisonItem, PlatformCostDetails, UserPreferences } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ShoppingBasket, SearchX } from 'lucide-react';
import { checkProductEquivalency } from '@/ai/flows/product-equivalency';
import { getSavingsSuggestions } from '@/ai/flows/savings-suggestion';
import { ScrollArea } from '@/components/ui/scroll-area';

const API_BASE_URL = 'https://qp94doiea4.execute-api.ap-south-1.amazonaws.com/default/qc';
const LAT = '12.9038';
const LON = '77.6648';

// Mock platform cost details (since API doesn't provide them)
// In a real app, this might come from a configuration service or be user-adjustable
const PLATFORM_COST_CONFIG: Record<string, PlatformCostDetails> = {
  'Swiggy Instamart': { name: 'Swiggy Instamart', icon: '', sla: '', open: true, storeId: '', deliveryFee: 25, platformFee: 10, minOrderValue: 199 },
  'Zepto': { name: 'Zepto', icon: '', sla: '', open: true, storeId: '', deliveryFee: 30, platformFee: 5, minOrderValue: 149 },
  'Blinkit': { name: 'Blinkit', icon: '', sla: '', open: true, storeId: '', deliveryFee: 20, platformFee: 10, minOrderValue: 249 },
  'Dunzo': { name: 'Dunzo', icon: '', sla: '', open: true, storeId: '', deliveryFee: 35, platformFee: 0, minOrderValue: 99 },
  'BigBasket': { name: 'BigBasket', icon: '', sla: '', open: true, storeId: '', deliveryFee: 50, platformFee: 0, minOrderValue: 500, discount: {type: 'fixed', value: 50, threshold: 1000} },
  'BBNow': { name: 'BBNow', icon: '', sla: '', open: true, storeId: '', deliveryFee: 25, platformFee: 5, minOrderValue: 199 },
  'DMart': { name: 'DMart', icon: '', sla: '', open: true, storeId: '', deliveryFee: 40, platformFee: 0, minOrderValue: 799 },
  'JioMart': { name: 'JioMart', icon: '', sla: '', open: true, storeId: '', deliveryFee: 45, platformFee: 0, minOrderValue: 399 },
   // Default for platforms not explicitly listed
  'default': { name: 'Other Platform', icon: '', sla: '', open: true, storeId: '', deliveryFee: 30, platformFee: 5, minOrderValue: 199 },
};

const getPlatformCosts = (platformName: string): PlatformCostDetails => {
  return PLATFORM_COST_CONFIG[platformName] || PLATFORM_COST_CONFIG['default'];
};


export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [savingsSuggestions, setSavingsSuggestions] = useState<SavingsSuggestion[]>([]);
  const [comparisonResults, setComparisonResults] = useState<ComparisonItem[]>([]);
  
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isComparing, setIsComparing] = useState(false);
  const [showComparisonView, setShowComparisonView] = useState(false);
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({ prioritize: 'cost' });


  const { toast } = useToast();

  const fetchProducts = useCallback(async (query: string) => {
    if (!query) return;
    setIsLoadingSearch(true);
    setProducts([]); 
    try {
      const response = await fetch(`${API_BASE_URL}?lat=${LAT}&lon=${LON}&type=groupsearch&query=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }
      const data: ApiResponse = await response.json();
      const flattenedProducts: Product[] = data.flatMap(group => 
        group.data.map(p => ({
          ...p,
          id: String(p.id || p.xid || Math.random().toString(36).substring(7)), 
          mrp: p.mrp,
          offer_price: p.offer_price,
          platform: { // Augment platform data with cost config
            ...p.platform,
            ...getPlatformCosts(p.platform.name),
          }
        }))
      );
      setProducts(flattenedProducts);
    } catch (error) {
      toast({
        title: "Search Error",
        description: "Could not fetch products. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingSearch(false);
    }
  }, [toast]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    fetchProducts(query);
  };

  const handleAddToCart = (product: Product) => {
    setCartItems(prevCartItems => {
      const existingItemIndex = prevCartItems.findIndex(item => item.id === product.id && item.platform.name === product.platform.name);
      if (existingItemIndex > -1) {
        const updatedCartItems = [...prevCartItems];
        updatedCartItems[existingItemIndex].cartQuantity += 1;
        return updatedCartItems;
      }
      // Ensure the product added to cart also has full platform cost details
      const platformWithCosts = {
        ...product.platform,
        ...getPlatformCosts(product.platform.name)
      };
      return [...prevCartItems, { ...product, platform: platformWithCosts, cartQuantity: 1 }];
    });
    toast({
      title: "Added to Cart",
      description: `${product.name} added to your cart.`,
    });
  };

  const handleUpdateQuantity = (productId: string, platformName: string, newQuantity: number) => {
    setCartItems(prevCartItems => {
      if (newQuantity <= 0) {
        return prevCartItems.filter(item => !(item.id === productId && item.platform.name === platformName));
      }
      return prevCartItems.map(item =>
        item.id === productId && item.platform.name === platformName ? { ...item, cartQuantity: newQuantity } : item
      );
    });
  };

  const handleRemoveItem = (productId: string, platformName: string) => {
    setCartItems(prevCartItems =>
      prevCartItems.filter(item => !(item.id === productId && item.platform.name === platformName))
    );
  };

  const fetchSavingsSuggestions = useCallback(async () => {
    if (cartItems.length === 0) {
      setSavingsSuggestions([]);
      return;
    }
    setIsLoadingSuggestions(true);
    try {
      const aiCartItems: AISavingsCartItem[] = cartItems.map(item => ({
        name: item.name,
        brand: item.brand,
        quantity: item.quantity, 
        price: parseFloat(String(item.offer_price || item.mrp)),
        platform: item.platform.name,
        cartQuantity: item.cartQuantity,
      }));
      
      const result = await getSavingsSuggestions({ cartItems: aiCartItems });
      setSavingsSuggestions(result.suggestions || []);
    } catch (error) {
      console.error("AI Suggestion Error:", error);
      toast({
        title: "AI Error",
        description: "Could not fetch savings suggestions.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingSuggestions(false);
    }
  }, [cartItems, toast]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (cartItems.length > 0) {
        fetchSavingsSuggestions();
      } else {
        setSavingsSuggestions([]);
      }
    }, 1500); 
    return () => clearTimeout(timer);
  }, [cartItems, fetchSavingsSuggestions]);


  const handleCompareCart = async () => {
    if (cartItems.length === 0) {
      toast({ title: "Cart is Empty", description: "Add items to your cart to compare prices.", variant: "default" });
      return;
    }
    if (products.length === 0 && cartItems.length > 0) {
        toast({ title: "No Search Results", description: "Please search for products to enable comprehensive comparison.", variant: "default" });
    }

    setIsComparing(true);
    setShowComparisonView(true);
    setComparisonResults([]);

    const newComparisonResults: ComparisonItem[] = [];

    for (const cartItem of cartItems) {
      const itemForEquivalency: ProductEquivalencyCheckItem = {
        name: cartItem.name,
        brand: cartItem.brand,
        quantity: cartItem.quantity,
      };

      const alternatives: ComparisonItem['alternatives'] = [];
      
      for (const product of products) {
        // Skip if it's the exact same item from the same platform
        if (product.id === cartItem.id && product.platform.name === cartItem.platform.name) {
          continue;
        }
        
        const productForEquivalency: ProductEquivalencyCheckItem = {
          name: product.name,
          brand: product.brand,
          quantity: product.quantity,
        };

        try {
          const equivalency = await checkProductEquivalency({
            product1: itemForEquivalency,
            product2: productForEquivalency,
          });
          
          // Ensure product has platform cost details before adding as alternative
           const platformDetails = getPlatformCosts(product.platform.name);
           const enrichedProduct = { ...product, platform: { ...product.platform, ...platformDetails } };


          if (equivalency.equivalent || product.name.toLowerCase().includes(cartItem.name.toLowerCase().substring(0,5))) { // Fallback name similarity
             alternatives.push({
              ...enrichedProduct, 
              isEquivalent: equivalency.equivalent,
              equivalencyReason: equivalency.reason,
              platformDetails: enrichedProduct.platform, // pass full platform details
            });
          }
        } catch (aiError) {
          toast({
            title: "AI Equivalency Error",
            description: `Could not check equivalency for ${product.name}. Comparing by name.`,
            variant: "destructive",
          });
           if (product.name.toLowerCase().includes(cartItem.name.toLowerCase().substring(0,5))) { // Fallback name similarity
            const platformDetails = getPlatformCosts(product.platform.name);
            const enrichedProduct = { ...product, platform: { ...product.platform, ...platformDetails } };
            alternatives.push({
             ...enrichedProduct,
             isEquivalent: false, 
             equivalencyReason: "AI check failed; similar name.",
             platformDetails: enrichedProduct.platform,
           });
         }
        }
      }
      
      // Sort alternatives by offer price first (further sorting by total cost can happen in ComparisonView)
      alternatives.sort((a, b) => parseFloat(String(a.offer_price || a.mrp)) - parseFloat(String(b.offer_price || b.mrp)));

      newComparisonResults.push({ originalItem: cartItem, alternatives });
    }
    
    setComparisonResults(newComparisonResults);
    setIsComparing(false);
  };


  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-6">
        <div className="mb-8 mt-4 flex justify-center">
          <SearchBar onSearch={handleSearch} isLoading={isLoadingSearch} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <ScrollArea className="lg:col-span-2 h-[calc(100vh-220px)] min-h-[400px] pr-2">
            {isLoadingSearch && (
              <div className="flex flex-col justify-center items-center py-10 min-h-[300px]">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
                <p className="ml-4 mt-4 text-xl text-muted-foreground">Searching for products...</p>
              </div>
            )}
            {!isLoadingSearch && products.length > 0 && (
              <ProductList products={products} onAddToCart={handleAddToCart} />
            )}
            {!isLoadingSearch && products.length === 0 && searchQuery && (
               <div className="text-center text-muted-foreground py-10 flex flex-col items-center justify-center min-h-[300px] border-2 border-dashed border-border rounded-lg bg-card/30">
                <SearchX className="h-20 w-20 text-primary mb-6" />
                <h2 className="text-3xl font-semibold mb-3 text-foreground">No Products Found</h2>
                <p className="text-lg">We couldn't find any products matching "{searchQuery}".</p>
                <p className="text-lg">Try a different search term or check spelling.</p>
              </div>
            )}
             {!isLoadingSearch && products.length === 0 && !searchQuery && (
              <div className="text-center text-muted-foreground py-10 flex flex-col items-center justify-center min-h-[300px] border-2 border-dashed border-border rounded-lg bg-card/30">
                <ShoppingBasket className="h-20 w-20 text-primary mb-6" />
                <h2 className="text-3xl font-semibold mb-3 text-foreground">Welcome to SaveIT.io!</h2>
                <p className="text-lg mb-1">Your smart grocery comparison companion.</p>
                <p className="text-lg">Search for products above to find the best prices and start saving.</p>
              </div>
            )}
          </ScrollArea>

          <div className="lg:col-span-1 lg:sticky lg:top-[calc(var(--header-height,60px)+1.5rem)] self-start">
            <CartPanel 
              cartItems={cartItems} 
              onUpdateQuantity={handleUpdateQuantity} 
              onRemoveItem={handleRemoveItem}
              onCompareCart={handleCompareCart}
              isComparing={isComparing}
              platformCostConfig={PLATFORM_COST_CONFIG} // Pass config to cart panel
            />
            <SavingsSuggestionsPanel suggestions={savingsSuggestions} isLoading={isLoadingSuggestions} />
          </div>
        </div>
      </main>
      {showComparisonView && (
          <ComparisonView 
            comparisonResults={comparisonResults} 
            onClose={() => setShowComparisonView(false)} 
            isLoading={isComparing}
            platformCostConfig={PLATFORM_COST_CONFIG} // Pass config to comparison view
          />
      )}
    </div>
  );
}
