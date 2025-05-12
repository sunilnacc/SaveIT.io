
export interface Platform {
  name: string;
  sla: string;
  icon: string;
  open: boolean;
  storeId: string;
}

export interface Product {
  id: string; // Can be string or number from API
  name: string;
  brand: string;
  available: boolean;
  images: string[];
  mrp: string | number; // API has string, sometimes number
  offer_price: string | number; // API has string, sometimes number
  unit_level_price?: string | number;
  quantity: string;
  deeplink: string;
  platform: Platform;
  inventory?: number | { total?: number; remaining?: number; message?: string; in_stock?: boolean };
}

export interface ApiProductGroup {
  data: Product[];
}

export type ApiResponse = ApiProductGroup[];


export interface CartItem extends Product {
  cartQuantity: number;
}

export interface SavingsSuggestion {
  suggestion: string;
  estimatedSavings: number;
}

// For AI Flow integration
export interface ProductEquivalencyCheckItem {
  name: string;
  brand?: string;
  quantity?: string;
}
export interface AISavingsCartItem {
  name: string;
  brand: string;
  quantity: string;
  price: number;
  platform: string;
}

export interface ComparisonItem {
  originalItem: CartItem;
  alternatives: (Product & { equivalencyReason?: string; isEquivalent?: boolean })[];
}
