
import type { User as FirebaseUser } from 'firebase/auth';

export interface Platform {
  name: string;
  sla: string;
  icon: string;
  open: boolean;
  storeId: string;
  // Added for more detailed cost analysis
  deliveryFee?: number;
  platformFee?: number;
  minOrderValue?: number;
  discount?: { type: 'percentage' | 'fixed'; value: number; threshold?: number }; // Example discount structure
}

export interface Product {
  id: string; // Can be string or number from API
  name:string;
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
  // Calculated fields for comparison
  effectivePrice?: number; 
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
  type?: 'cost' | 'mov_alert' | 'convenience'; // Added to categorize suggestions
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
  quantity: string; // e.g. "1 unit", "500g" - cartQuantity will be used to multiply
  price: number; // price per single unit
  platform: string;
  cartQuantity: number; // how many of this item are in the cart
}

export interface ComparisonItem {
  originalItem: CartItem;
  alternatives: (Product & { 
    equivalencyReason?: string; 
    isEquivalent?: boolean;
    platformDetails?: Platform; // To access fees for this specific alternative's platform
    calculatedTotalCost?: number; // Item price * quantity + delivery + platform fee
    savingsComparedToOriginal?: number;
    meetsMOV?: boolean; // Does this alternative, if cart moved, meet platform's MOV?
  })[];
}

// Authentication Types
export interface SignUpCredentials {
  email: string;
  password?: string; // Optional if using OAuth providers in future
  name?: string; // Optional
}

export interface LoginCredentials {
  email: string;
  password?: string; // Optional if using OAuth providers in future
}

export interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  error: string | null;
  setError: (error: string | null) => void;
  setUser: (user: FirebaseUser | null) => void; // Added to allow manual user set if needed
}

// Theme Types
export type Theme = 'light' | 'dark';

export interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export interface UserPreferences {
  prioritize: 'cost' | 'speed'; // Example, speed is harder to implement without data
  // Could add more like preferredPlatforms, etc.
}

// Mock structure for platform-specific cost details not available from API
export interface PlatformCostDetails extends Platform {
  // deliveryFee: number; // Now part of Platform
  // platformFee: number; // Now part of Platform
  // minOrderValue: number; // Now part of Platform
  // discount?: { type: 'percentage' | 'fixed'; value: number; threshold?: number }; // Now part of Platform
}
