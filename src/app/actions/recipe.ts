'use server';

/**
 * Server actions for recipe functionality
 * This file contains server-side functions that can be called from client components
 */

import { findRecipeIngredients, searchIngredientPrices } from '@/ai/flows/recipe-shopping';

export async function getRecipeIngredients(recipeName: string) {
  try {
    return await findRecipeIngredients({ recipeName });
  } catch (error) {
    console.error('Error finding recipe ingredients:', error);
    throw new Error('Failed to find recipe ingredients');
  }
}

type Platform = 'Swiggy Instamart' | 'Zepto' | 'Blinkit' | 'Dunzo' | 'BigBasket' | 'BBNow' | 'DMart' | 'JioMart';

interface Ingredient {
  name: string;
  quantity: string;
  alternatives?: string[];
}

// Helper function to check if an ingredient is a basic one that will be skipped in search
function isBasicIngredient(name: string): boolean {
  const basicIngredients = ['water', 'warm water', 'hot water', 'cold water', 'salt', 'pepper', 'sugar'];
  return basicIngredients.some(item => name.toLowerCase().includes(item));
}

export async function searchForIngredientPrices(
  ingredients: Ingredient[], 
  platforms: Platform[]
) {
  try {
    console.log('Server received search request for ingredients:', ingredients.map(i => i.name));
    
    // The client has already filtered out basic ingredients and ingredients the user has
    // We'll trust the client's filtering and process all received ingredients
    if (ingredients.length === 0) {
      console.log('No ingredients to search for');
      return {
        results: [],
        message: 'No ingredients to search for.'
      };
    }
    
    // Log the actual ingredients being searched for
    console.log('Processing search for ingredients:', ingredients.map(i => i.name));
    
    return await searchIngredientPrices({ ingredients, platforms });
  } catch (error) {
    console.error('Error searching for ingredient prices:', error);
    throw new Error('Failed to search for ingredient prices');
  }
}
