/**
 * @fileOverview An AI agent that helps users shop for recipe ingredients by finding the best prices across platforms.
 * - findRecipeIngredients - Finds ingredients for a recipe
 * - searchIngredientPrices - Searches for ingredient prices across platforms
 * - createShoppingCart - Creates a shopping cart with the best prices
 *
 * NOTE: This file is imported by server components. All exported functions should be async.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// Define Platform type to match the one in RecipeAssistant.tsx
type Platform = 'Swiggy Instamart' | 'Zepto' | 'Blinkit' | 'Dunzo' | 'BigBasket' | 'BBNow' | 'DMart' | 'JioMart';

// API endpoint and location details
const API_BASE_URL = 'https://qp94doiea4.execute-api.ap-south-1.amazonaws.com/default/qc';
const LAT = '12.9038';
const LON = '77.6648';

// Define types for platform costs
interface PlatformCostDetails {
  deliveryFee: number;
  platformFee: number;
  minOrderValue: number;
  discount?: {
    type: 'fixed' | 'percentage';
    value: number;
    threshold?: number;
  };
}

const PLATFORM_COST_CONFIG: Record<string, PlatformCostDetails> = {
  'Swiggy Instamart': { deliveryFee: 30, platformFee: 5, minOrderValue: 199 },
  'Zepto': { deliveryFee: 30, platformFee: 5, minOrderValue: 149 },
  'Blinkit': { deliveryFee: 30, platformFee: 5, minOrderValue: 199 },
  'Dunzo': { deliveryFee: 40, platformFee: 10, minOrderValue: 299 },
  'BigBasket': { deliveryFee: 50, platformFee: 0, minOrderValue: 500 },
  'BBNow': { deliveryFee: 40, platformFee: 0, minOrderValue: 250 },
  'DMart': { deliveryFee: 40, platformFee: 0, minOrderValue: 799 },
  'JioMart': { deliveryFee: 30, platformFee: 5, minOrderValue: 199 },
  'Swiggy': { deliveryFee: 30, platformFee: 5, minOrderValue: 199 },
  'BlinkIt': { deliveryFee: 30, platformFee: 5, minOrderValue: 199 },
  'default': { deliveryFee: 40, platformFee: 5, minOrderValue: 299 }
};

// Define types and schemas
const IngredientSchema = z.object({
  name: z.string().describe('The name of the ingredient.'),
  quantity: z.string().describe('The required quantity with units (e.g., "2 cups", "500g").'),
  alternatives: z.array(z.string()).optional().describe('Alternative names for the ingredient.')
});

const RecipeSchema = z.object({
  name: z.string().describe('The name of the recipe.'),
  ingredients: z.array(IngredientSchema).describe('List of ingredients required for the recipe.')
});

const PlatformSchema = z.enum([
  'Swiggy Instamart',
  'Zepto',
  'Blinkit',
  'Dunzo',
  'BigBasket',
  'BBNow',
  'DMart',
  'JioMart'
]);

const ProductSchema = z.object({
  name: z.string().describe('The name of the product.'),
  platform: PlatformSchema,
  price: z.number().describe('The price of the product.'),
  image: z.string().optional().describe('URL of the product image.'),
  url: z.string().optional().describe('URL to the product page.'),
  originalQuantity: z.string().optional().describe('The original requested quantity.'),
  brand: z.string().optional().describe('Brand of the product.'),
  quantity: z.string().optional().describe('Quantity/size of the product.'),
  rating: z.number().optional().describe('Rating of the product if available.'),
  deliveryFee: z.number().optional().describe('Delivery fee for the platform.'),
  platformFee: z.number().optional().describe('Platform fee for the platform.'),
  minOrderValue: z.number().optional().describe('Minimum order value for the platform.')
});

const CartSchema = z.record(PlatformSchema, z.array(ProductSchema));

// Input/Output schemas
export const FindRecipeIngredientsInput = z.object({
  recipeName: z.string().describe('The name of the recipe to find ingredients for.')
});

export const FindRecipeIngredientsOutput = z.object({
  recipe: RecipeSchema,
  message: z.string().describe('A friendly message about the recipe and ingredients.')
});

export const SearchIngredientPricesInput = z.object({
  ingredients: z.array(IngredientSchema),
  platforms: z.array(PlatformSchema).default(() => [
    'Swiggy Instamart', 'Zepto', 'Blinkit'
  ] as Array<z.infer<typeof PlatformSchema>>)
});

export const SearchIngredientPricesOutput = z.object({
  results: z.array(ProductSchema),
  message: z.string().describe('Summary of the search results.')
});

export const CreateShoppingCartInput = z.object({
  products: z.array(ProductSchema)
});

export const CreateShoppingCartOutput = z.object({
  cart: CartSchema,
  totalByPlatform: z.record(PlatformSchema, z.number()),
  bestPlatform: PlatformSchema.optional(),
  message: z.string().describe('Summary of the shopping cart.')
});

// Define prompts
const findRecipePrompt = ai.definePrompt({
  name: 'findRecipePrompt',
  input: { schema: FindRecipeIngredientsInput },
  output: { schema: FindRecipeIngredientsOutput },
  prompt: `You are an expert chef and nutritionist who helps people find recipes and identify the ingredients needed.

Please provide a detailed list of ingredients needed for this recipe. For each ingredient, include:
- The exact name as it would appear in a grocery store (use simple, searchable terms)
- The required quantity with units (e.g., "2 cups", "500g")

Be specific about the type and form of each ingredient (e.g., "fresh basil leaves" rather than just "basil").

For the recipe: {{{recipeName}}}`
});

const searchPricesPrompt = ai.definePrompt({
  name: 'searchPricesPrompt',
  input: { schema: SearchIngredientPricesInput },
  output: { schema: SearchIngredientPricesOutput },
  prompt: `Search for the following ingredients on the specified platforms and return the best match for each:

Ingredients to search for:
{{#each ingredients}}
- {{name}} ({{quantity}})
{{/each}}

Platforms to search: {{platforms}}

For each ingredient, find the most relevant product on each platform. Consider:
1. Name match (including common alternative names)
2. Appropriate quantity/size
3. Price competitiveness

Return a list of products with their platform, price, and direct link.`
});

const createCartPrompt = ai.definePrompt({
  name: 'createCartPrompt',
  input: { schema: CreateShoppingCartInput },
  output: { schema: CreateShoppingCartOutput },
  prompt: `Create an optimized shopping cart from the following products:

{{#each products}}
- {{name}} ({{platform}}): ₹{{price}}
{{/each}}

Group the products by platform and calculate the total for each platform. 
Identify which platform offers the best overall price.

Return the cart organized by platform with totals and a recommendation.`
});

// Define flows
export const findRecipeIngredients = ai.defineFlow(
  {
    name: 'findRecipeIngredients',
    inputSchema: FindRecipeIngredientsInput,
    outputSchema: FindRecipeIngredientsOutput,
  },
  async (input) => {
    const { output } = await findRecipePrompt(input);
    return output!;
  }
);

// Helper function to normalize platform names to match the expected enum values
function normalizePlatformName(platformName: string): Platform {
  // Map of API platform names to our platform enum values
  const platformMap: Record<string, Platform> = {
    'Swiggy': 'Swiggy Instamart',
    'swiggy': 'Swiggy Instamart',
    'Zepto': 'Zepto',
    'zepto': 'Zepto',
    'BlinkIt': 'Blinkit',
    'blinkit': 'Blinkit',
    'Dunzo': 'Dunzo',
    'dunzo': 'Dunzo',
    'BigBasket': 'BigBasket',
    'bigbasket': 'BigBasket',
    'BBNow': 'BBNow',
    'bbnow': 'BBNow',
    'DMart': 'DMart',
    'dmart': 'DMart',
    'JioMart': 'JioMart',
    'Jiomart': 'JioMart',
    'jiomart': 'JioMart'
  };
  
  // Return the mapped platform name or the original if not found
  return platformMap[platformName] || platformName as Platform;
}

// Helper function to simplify ingredient names for better API compatibility
function simplifyIngredientName(ingredient: string): string {
  // Skip searching for basic ingredients that don't need to be purchased
  const skipIngredients = ['water', 'warm water', 'hot water', 'cold water', 'lukewarm water', 'salt', 'fine sea salt', 'pepper', 'sugar'];
  if (skipIngredients.some(item => ingredient.toLowerCase().includes(item))) {
    return ''; // Return empty string to skip this ingredient
  }
  
  // Simplify complex ingredient names
  const simplifications: Record<string, string> = {
    // Flours
    'all-purpose flour': 'flour',
    'all purpose flour': 'flour',
    
    // Yeasts
    'instant dry yeast': 'yeast',
    'active dry yeast': 'yeast',
    
    // Tomatoes
    'crushed tomatoes': 'tomato',
    'tomato sauce': 'tomato',
    'tomato paste': 'tomato',
    
    // Cheeses
    'shredded mozzarella cheese': 'mozzarella',
    'fresh mozzarella cheese': 'mozzarella',
    'mozzarella cheese': 'mozzarella',
    'shredded cheese': 'cheese',
    
    // Herbs and spices
    'fresh basil leaves': 'basil',
    'dried oregano': 'oregano',
    'garlic powder': 'garlic',
    'fenugreek seeds': 'fenugreek',
    
    // Oils
    'olive oil': 'oil',
    'extra virgin olive oil': 'oil',
    'vegetable oil': 'oil',
    
    // Basic ingredients
    'granulated sugar': 'sugar',
    'fine sea salt': 'salt',
    'optional toppings': '',
    
    // Rice and grains
    'parboiled rice': 'parboiled rice',
    'idli rice': 'idli rice',
    
    // Lentils and beans
    'white urad dal': 'urad dal',
    'whole white urad dal': 'urad dal',
    'urad dal': 'urad dal',

    // Eggs
    'Large eggs': 'egg',
    'Counted eggs': 'egg',
    'Dozen eggs': 'egg'
  };
  
  // Check for matches in simplifications
  const lowerIngredient = ingredient.toLowerCase();
  for (const [complex, simple] of Object.entries(simplifications)) {
    if (lowerIngredient.includes(complex)) {
      return simple;
    }
  }
  
  // Extract the main ingredient name
  const words = ingredient.split(' ');
  if (words.length > 1) {
    // Special cases for specific ingredient types
    if (ingredient.toLowerCase().includes('rice')) {
      return 'rice'; // For any type of rice, search for 'rice'
    }
    if (ingredient.toLowerCase().includes('dal') || ingredient.toLowerCase().includes('lentil')) {
      // For dal/lentils, use the last word which is usually the specific type
      const lastWord = words[words.length - 1];
      return lastWord === 'dal' && words.length > 1 ? words[words.length - 2] + ' ' + lastWord : lastWord;
    }
    
    // For most ingredients, the first word is the main ingredient
    // But avoid using words like 'fresh', 'dried', etc. as the main ingredient
    const skipFirstWords = ['fresh', 'dried', 'ground', 'chopped', 'sliced', 'diced', 'minced', 'grated', 'optional', 'whole', 'white'];
    if (skipFirstWords.includes(words[0].toLowerCase())) {
      // If the first word should be skipped, use the second word
      return words.length > 2 ? words[1] : ingredient;
    }
    
    // Default to the first word for most ingredients
    return words[0];
  }
  
  // Return the original if no simplification is found
  return ingredient;
}

// Helper function to fetch products for an ingredient from the API
async function fetchProductsForIngredient(ingredient: string) {
  try {
    // Simplify the ingredient name for better API compatibility
    const simplifiedIngredient = simplifyIngredientName(ingredient);
    
    // Skip searching for basic ingredients
    if (!simplifiedIngredient) {
      console.log(`Skipping search for basic ingredient: ${ingredient}`);
      return { data: [] };
    }
    
    // Use the correct API endpoint format
    const url = `${API_BASE_URL}?lat=${LAT}&lon=${LON}&type=groupsearch&query=${encodeURIComponent(simplifiedIngredient)}`;
    console.log(`Searching for ${ingredient} as '${simplifiedIngredient}' at ${url}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.warn(`API request for ${simplifiedIngredient} returned status ${response.status} - continuing with other ingredients`);
      return { data: [] }; // Return empty data but don't throw error
    }
    
    const responseData = await response.json();
    
    // Process the response data to extract products
    let allProducts: any[] = [];
    if (Array.isArray(responseData)) {
      // Extract products from each data group
      responseData.forEach(group => {
        if (group.data && Array.isArray(group.data)) {
          allProducts = [...allProducts, ...group.data];
        }
      });
    }
    
    return { data: allProducts };
  } catch (error) {
    console.error(`Error fetching products for ${ingredient}:`, error);
    return { data: [] };
  }
}

// Helper function to let the AI choose the best product for each ingredient on each platform
const selectBestProductPrompt = ai.definePrompt({
  name: 'selectBestProductPrompt',
  input: {
    schema: z.object({
      ingredient: z.string(),
      requiredQuantity: z.string(),
      products: z.array(z.any())
    })
  },
  output: {
    schema: z.object({
      selectedProduct: z.object({
        name: z.string(),
        platform: z.string(),
        price: z.number(),
        brand: z.string().optional(),
        quantity: z.string().optional(),
        image: z.string().optional(),
        rating: z.number().optional(),
        reason: z.string()
      })
    })
  },
  prompt: `You are an expert shopping assistant helping to select the best product for a recipe ingredient.

Ingredient needed: {{{ingredient}}}
Required quantity: {{{requiredQuantity}}}

Available products:
{{#each products}}
- Platform: {{platform}}
  Name: {{name}}
  Price: ₹{{price}}
  {{#if brand}}Brand: {{brand}}{{/if}}
  {{#if quantity}}Quantity: {{quantity}}{{/if}}
  {{#if rating}}Rating: {{rating}}/5{{/if}}
{{/each}}

Please select the best product based on:
1. Match with the required ingredient
2. Appropriate quantity (closest to required)
3. Price (good value)
4. Brand reputation (if known)
5. Rating (if available)

Return a single product with name, platform, price, brand, quantity, image URL (if available), rating (if available), and a brief reason for your selection.`
});

export const searchIngredientPrices = ai.defineFlow(
  {
    name: 'searchIngredientPrices',
    inputSchema: SearchIngredientPricesInput,
    outputSchema: SearchIngredientPricesOutput,
  },
  async (input) => {
    try {
      const results: z.infer<typeof ProductSchema>[] = [];
      const platformsMap = new Map<string, any[]>();
      const unavailableIngredients: string[] = [];
      
      console.log('Server received ingredients to search:', input.ingredients.map(i => i.name));
      
      // Process ingredients in parallel
      const ingredientPromises = input.ingredients.map(async (ingredient) => {
        console.log(`Searching for ingredient: ${ingredient.name}`);
        try {
          const response = await fetchProductsForIngredient(ingredient.name);
          
          if (!response.data || response.data.length === 0) {
            console.log(`No products found for ${ingredient.name}`);
            unavailableIngredients.push(ingredient.name);
            return { ingredient: ingredient.name, platforms: {} };
          }
          
          // Group products by platform
          const productsByPlatform: Record<string, any[]> = {};
          
          for (const product of response.data) {
            if (!product.platform || !product.platform.name) continue;
            
            // Map platform names to the expected enum values
            const platformName = product.platform.name;
            const normalizedPlatform = normalizePlatformName(platformName);
            
            if (!productsByPlatform[normalizedPlatform]) {
              productsByPlatform[normalizedPlatform] = [];
            }
            
            productsByPlatform[normalizedPlatform].push(product);
          }
          
          return { ingredient, productsByPlatform };
        } catch (error) {
          console.error(`Error processing ingredient ${ingredient.name}:`, error);
          unavailableIngredients.push(ingredient.name);
          return { ingredient: ingredient.name, platforms: {} };
        }
      });
      
      // Wait for all ingredient searches to complete
      const ingredientResults = await Promise.all(ingredientPromises);
      
      // Process each ingredient's results
      for (const result of ingredientResults) {
        // Skip if we only have the ingredient name (from error case) or if productsByPlatform is undefined
        if (typeof result.ingredient === 'string' || !result.productsByPlatform) continue;
        
        const { ingredient, productsByPlatform } = result;
        
        // Process each platform's products for this ingredient
        for (const [platformName, platformProducts] of Object.entries(productsByPlatform)) {
          if (!platformProducts || platformProducts.length === 0) continue;
          
          try {
            // Format products for AI selection
            const formattedProducts = platformProducts.map((product: any) => ({
              name: product.name || '',
              platform: platformName as Platform,
              price: parseFloat(product.offer_price || product.mrp) || 0,
              brand: product.brand || '',
              quantity: product.quantity || '',
              image: product.image || ((product.images && product.images.length > 0) ? product.images[0] : undefined),
              url: product.deeplink || product.url || undefined,
              rating: product.rating || undefined,
              available: product.available !== false
            }));
            
            // Filter out unavailable products
            const availableProducts = formattedProducts.filter((p: any) => p.available);
            if (availableProducts.length === 0) continue;
            
            // Use AI to select the best product
            const { output } = await selectBestProductPrompt({
              ingredient: ingredient.name,
              requiredQuantity: ingredient.quantity,
              products: availableProducts
            });
            
            if (output?.selectedProduct) {
              const selected = output.selectedProduct;
              const platformDetails = PLATFORM_COST_CONFIG[platformName] || PLATFORM_COST_CONFIG.default;
              
              // Add to results
              results.push({
                name: selected.name,
                platform: platformName as Platform,
                price: selected.price,
                brand: selected.brand,
                quantity: selected.quantity,
                image: selected.image,
                rating: selected.rating,
                originalQuantity: ingredient.quantity,
                deliveryFee: platformDetails.deliveryFee,
                platformFee: platformDetails.platformFee,
                minOrderValue: platformDetails.minOrderValue
              });
              
              // Track products by platform for cart creation
              if (!platformsMap.has(platformName)) {
                platformsMap.set(platformName, []);
              }
              platformsMap.get(platformName)?.push({
                ...selected,
                ingredient: ingredient.name,
                originalQuantity: ingredient.quantity
              });
            }
          } catch (err) {
            console.error(`Error selecting best product for ${ingredient.name} on ${platformName}:`, err);
            
            // Fallback: just use the first product
            if (platformProducts.length > 0) {
              const product = platformProducts[0];
              const platformDetails = PLATFORM_COST_CONFIG[platformName] || PLATFORM_COST_CONFIG.default;
              
              const price = parseFloat(product.offer_price || product.mrp) || 0;
              
              results.push({
                name: product.name || `${ingredient.name} (${platformName})`,
                platform: platformName as Platform,
                price: price,
                brand: product.brand || '',
                quantity: product.quantity || '',
                image: product.image || ((product.images && product.images.length > 0) ? product.images[0] : undefined),
                originalQuantity: ingredient.quantity,
                deliveryFee: platformDetails.deliveryFee,
                platformFee: platformDetails.platformFee,
                minOrderValue: platformDetails.minOrderValue
              });
            }
          }
        }
      }
      // Create a message that includes information about unavailable ingredients
      let message = `Found ${results.length} products across ${platformsMap.size} platforms.`;
      if (unavailableIngredients.length > 0) {
        message += ` Unable to find: ${unavailableIngredients.join(', ')}.`;
      }
      
      return {
        results,
        message
      };
    } catch (error) {
      console.error('Error in searchIngredientPrices:', error);
      // Fallback to LLM if API fails
      const { output } = await searchPricesPrompt(input);
      return output!;
    }
  }
);

export const createShoppingCart = ai.defineFlow(
  {
    name: 'createShoppingCart',
    inputSchema: CreateShoppingCartInput,
    outputSchema: CreateShoppingCartOutput,
  },
  async (input) => {
    const { output } = await createCartPrompt(input);
    return output!;
  }
);

// Main flow that ties everything together
export const recipeShoppingFlow = ai.defineFlow(
  {
    name: 'recipeShoppingFlow',
    inputSchema: FindRecipeIngredientsInput,
    outputSchema: CreateShoppingCartOutput,
  },
  async (input) => {
    try {
      // Step 1: Find recipe ingredients
      const { recipe } = await findRecipeIngredients(input);
      
      // Step 2: Search for ingredient prices
      const { results } = await searchIngredientPrices({
        ingredients: recipe.ingredients,
        platforms: ['Swiggy Instamart', 'Zepto', 'Blinkit', 'Dunzo', 'BigBasket', 'BBNow', 'DMart', 'JioMart']
      });
      
      // Create a cart structure organized by platform
      const cartByPlatform: Record<string, z.infer<typeof ProductSchema>[]> = {};
      const totalByPlatform: Record<string, number> = {};
      
      // Initialize platforms
      for (const platform of ['Swiggy Instamart', 'Zepto', 'Blinkit', 'Dunzo', 'BigBasket', 'BBNow', 'DMart', 'JioMart'] as const) {
        cartByPlatform[platform] = [];
        totalByPlatform[platform] = 0;
      }
      
      // Organize products by platform
      for (const product of results) {
        cartByPlatform[product.platform].push(product);
        totalByPlatform[product.platform] += product.price;
      }
      
      // Find the best platform (lowest total price with most items)
      let bestPlatform: z.infer<typeof PlatformSchema> | undefined;
      let lowestTotal = Infinity;
      let mostItems = 0;
      
      for (const platform of Object.keys(totalByPlatform) as z.infer<typeof PlatformSchema>[]) {
        const itemCount = cartByPlatform[platform].length;
        const total = totalByPlatform[platform];
        
        if (itemCount > 0 && (total < lowestTotal || (total === lowestTotal && itemCount > mostItems))) {
          lowestTotal = total;
          mostItems = itemCount;
          bestPlatform = platform;
        }
      }
      
      return {
        cart: cartByPlatform as z.infer<typeof CartSchema>,
        totalByPlatform: totalByPlatform as Record<z.infer<typeof PlatformSchema>, number>,
        bestPlatform,
        message: bestPlatform 
          ? `${bestPlatform} offers the best overall price at ₹${totalByPlatform[bestPlatform].toFixed(2)}.`
          : 'No platform offers a complete set of ingredients.'
      };
    } catch (error) {
      console.error('Error in recipeShoppingFlow:', error);
      // Return an empty cart if there's an error
      return {
        cart: {
          'Swiggy Instamart': [],
          'Zepto': [],
          'Blinkit': [],
          'Dunzo': [],
          'BigBasket': [],
          'BBNow': [],
          'DMart': [],
          'JioMart': []
        },
        totalByPlatform: {
          'Swiggy Instamart': 0,
          'Zepto': 0,
          'Blinkit': 0,
          'Dunzo': 0,
          'BigBasket': 0,
          'BBNow': 0,
          'DMart': 0,
          'JioMart': 0
        },
        message: 'Sorry, there was an error finding ingredients. Please try again.'
      };
    }
  }
);
