
import type { User as FirebaseUser } from 'firebase/auth';

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
