'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Header from '@/components/savvy-cart/Header';
import SearchBar from '@/components/savvy-cart/SearchBar';
import ProductList from '@/components/savvy-cart/ProductList';
import CartPanel from '@/components/savvy-cart/CartPanel';
import SavingsSuggestionsPanel from '@/components/savvy-cart/SavingsSuggestionsPanel';
import ComparisonView from '@/components/savvy-cart/ComparisonView';
import type { Product, CartItem, ApiResponse, SavingsSuggestion, ProductEquivalencyCheckItem, AISavingsCartItem, ComparisonItem } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { checkProductEquivalency } from '@/ai/flows/product-equivalency';
import { getSavingsSuggestions } from '@/ai/flows/savings-suggestion';
import { ScrollArea } from '@/components/ui/scroll-area';

const API_BASE_URL = 'https://qp94doiea4.execute-api.ap-south-1.amazonaws.com/default/qc';
const LAT = '12.9038';
const LON = '77.6648';

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

  const { toast } = useToast();

  const fetchProducts = useCallback(async (query: string) => {
    if (!query) return;
    setIsLoadingSearch(true);
    setProducts([]); // Clear previous results
    try {
      const response = await fetch(`${API_BASE_URL}?lat=${LAT}&lon=${LON}&type=groupsearch&query=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }
      const data: ApiResponse = await response.json();
      const flattenedProducts: Product[] = data.flatMap(group => 
        group.data.map(p => ({
          ...p,
          id: String(p.id || p.xid || Math.random().toString(36).substring(7)), // Ensure ID is string
          mrp: p.mrp,
          offer_price: p.offer_price
        }))
      );
      setProducts(flattenedProducts);
    } catch (error) {
      console.error("Failed to fetch products:", error);
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
      return [...prevCartItems, { ...product, cartQuantity: 1 }];
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
        quantity: `${item.cartQuantity} x ${item.quantity}`,
        price: parseFloat(String(item.offer_price || item.mrp)),
        platform: item.platform.name,
      }));
      
      const result = await getSavingsSuggestions({ cartItems: aiCartItems });
      setSavingsSuggestions(result.suggestions || []);
    } catch (error) {
      console.error("Failed to fetch savings suggestions:", error);
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
    // Debounce or delay fetching suggestions
    const timer = setTimeout(() => {
      if (cartItems.length > 0) {
        fetchSavingsSuggestions();
      } else {
        setSavingsSuggestions([]);
      }
    }, 1500); // Fetch suggestions 1.5s after cart changes
    return () => clearTimeout(timer);
  }, [cartItems, fetchSavingsSuggestions]);


  const handleCompareCart = async () => {
    if (products.length === 0 || cartItems.length === 0) {
      toast({ title: "Cannot Compare", description: "Please search for products and add items to cart first.", variant: "destructive" });
      return;
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

      const alternatives: (Product & { equivalencyReason?: string; isEquivalent?: boolean })[] = [];
      // Find alternatives from the general product search results
      for (const product of products) {
        // Skip if it's the same item from the same platform
        if (product.id === cartItem.id && product.platform.name === cartItem.platform.name) {
          continue;
        }

        // Basic filter: same brand, or if item is generic, potentially other brands too.
        // For now, let's be a bit loose or use AI for deeper check.
        // Let's consider products with similar names or if AI confirms equivalency
        
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
          
          // Add to alternatives if AI says it's equivalent OR if names are very similar (fallback)
          // For this demo, let's be more inclusive if AI says equivalent or names are quite similar
          // This logic can be tuned.
          if (equivalency.equivalent || product.name.toLowerCase().includes(cartItem.name.toLowerCase().substring(0,5))) {
             alternatives.push({
              ...product,
              isEquivalent: equivalency.equivalent,
              equivalencyReason: equivalency.reason,
            });
          }
        } catch (aiError) {
          console.error("AI equivalency check error for", product.name, aiError);
          // Optionally add with a note about failed check if names are very similar
        }
      }
      
      // Sort alternatives by price (offer_price or mrp)
      alternatives.sort((a, b) => parseFloat(String(a.offer_price || a.mrp)) - parseFloat(String(b.offer_price || b.mrp)));

      newComparisonResults.push({ originalItem: cartItem, alternatives });
    }
    
    setComparisonResults(newComparisonResults);
    setIsComparing(false);
  };


  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-6">
        <div className="mb-8 mt-4 flex justify-center">
          <SearchBar onSearch={handleSearch} isLoading={isLoadingSearch} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <ScrollArea className="lg:col-span-2 h-[calc(100vh-200px)] pr-2"> {/* Adjust height as needed */}
            {isLoadingSearch && (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="ml-4 text-lg">Searching for products...</p>
              </div>
            )}
            {!isLoadingSearch && products.length > 0 && (
              <ProductList products={products} onAddToCart={handleAddToCart} />
            )}
            {!isLoadingSearch && products.length === 0 && searchQuery && (
              <p className="text-center text-muted-foreground py-10 text-lg">No products found for "{searchQuery}". Try a different search.</p>
            )}
             {!isLoadingSearch && products.length === 0 && !searchQuery && (
              <div className="text-center text-muted-foreground py-10">
                <h2 className="text-2xl font-semibold mb-2">Welcome to SavvyCart!</h2>
                <p>Start by searching for your favorite grocery items.</p>
              </div>
            )}
          </ScrollArea>

          <div className="lg:col-span-1 lg:sticky lg:top-[calc(var(--header-height,60px)+1.5rem)] self-start"> {/* Sticky cart */}
            <CartPanel 
              cartItems={cartItems} 
              onUpdateQuantity={handleUpdateQuantity} 
              onRemoveItem={handleRemoveItem}
              onCompareCart={handleCompareCart}
              isComparing={isComparing}
            />
            <SavingsSuggestionsPanel suggestions={savingsSuggestions} isLoading={isLoadingSuggestions} />
          </div>
        </div>
      </main>
      {showComparisonView && comparisonResults && (
          <ComparisonView comparisonResults={comparisonResults} onClose={() => setShowComparisonView(false)} />
      )}
    </div>
  );
}
