'use client';

import { useState, useEffect, useCallback } from 'react';
import { Loader2, ShoppingCart, Check, X, ChefHat, AlertCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getRecipeIngredients, searchForIngredientPrices } from '@/app/actions/recipe';
import Image from 'next/image';

type Platform = 'Swiggy Instamart' | 'Zepto' | 'Blinkit' | 'Dunzo' | 'BigBasket' | 'BBNow' | 'DMart' | 'JioMart';

interface Ingredient {
  name: string;
  quantity: string;
  alternatives?: string[];
}

interface Product {
  name: string;
  platform: Platform;
  price: number;
  image?: string;
  url?: string;
  originalQuantity?: string;
  brand?: string;
  quantity?: string;
  rating?: number;
  deliveryFee?: number;
  platformFee?: number;
  minOrderValue?: number;
}

interface Cart {
  [platform: string]: Product[];
}

const PLATFORM_NAMES: Record<Platform, string> = {
  'Swiggy Instamart': 'Swiggy Instamart',
  'Zepto': 'Zepto',
  'Blinkit': 'Blinkit',
  'Dunzo': 'Dunzo',
  'BigBasket': 'BigBasket',
  'BBNow': 'BBNow',
  'DMart': 'DMart',
  'JioMart': 'JioMart'
};

const PLATFORM_COLORS: Record<Platform, string> = {
  'Swiggy Instamart': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  'Zepto': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  'Blinkit': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  'Dunzo': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  'BigBasket': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  'BBNow': 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400',
  'DMart': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  'JioMart': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400'
};

export function RecipeAssistant() {
  const [recipeName, setRecipeName] = useState('');
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [cart, setCart] = useState<Cart>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isApiLoading, setIsApiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [platforms, setPlatforms] = useState<Platform[]>(['Swiggy Instamart', 'Zepto', 'Blinkit']);
  const [step, setStep] = useState<'input' | 'ingredients' | 'cart'>('input');
  const [unavailableIngredients, setUnavailableIngredients] = useState<string[]>([]);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [userHasIngredients, setUserHasIngredients] = useState<string[]>([]);
  const [ingredientsToSearch, setIngredientsToSearch] = useState<Ingredient[]>([]);
  
  // AI thinking process states
  const [aiThoughts, setAiThoughts] = useState<string[]>([]);
  const [searchQueries, setSearchQueries] = useState<{original: string, simplified: string}[]>([]);
  const [currentAction, setCurrentAction] = useState<string>('');
  
  // Function to check if an ingredient is a basic one that will be skipped in search
  const isBasicIngredient = useCallback((name: string) => {
    const basicIngredients = ['water', 'warm water', 'hot water', 'cold water', 'salt', 'pepper', 'sugar'];
    return basicIngredients.some(item => name.toLowerCase().includes(item));
  }, []);
  
  // Function to toggle whether user has an ingredient
  const toggleUserHasIngredient = (ingredientName: string) => {
    console.log('Toggling ingredient:', ingredientName);
    setUserHasIngredients(prev => {
      const newList = prev.includes(ingredientName)
        ? prev.filter(name => name !== ingredientName)
        : [...prev, ingredientName];
      
      console.log('New userHasIngredients:', newList);
      return newList;
    });
  };

  const togglePlatform = (platform: Platform) => {
    setPlatforms(prev => 
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const handleFindRecipe = useCallback(async () => {
    if (!recipeName.trim()) {
      setError('Please enter a recipe name');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Call the server action to get recipe ingredients
      const result = await getRecipeIngredients(recipeName.trim());
      
      setIngredients(result.recipe.ingredients);
      setStep('ingredients');
    } catch (err) {
      setError('Failed to find recipe. Please try again.');
      console.error('Error finding recipe:', err);
    } finally {
      setIsLoading(false);
    }
  }, [recipeName]);

  // Function to add AI thinking steps with a delay for realism
  const addAiThought = useCallback((thought: string) => {
    setAiThoughts(prev => [...prev, thought]);
  }, []);

  // Function to track search queries
  const addSearchQuery = useCallback((original: string, simplified: string) => {
    // Only add the search query if the ingredient is not in userHasIngredients and not a basic ingredient
    if (!userHasIngredients.includes(original) && !isBasicIngredient(original)) {
      setSearchQueries(prev => [...prev, { original, simplified }]);
    }
  }, [userHasIngredients]);

  // Use regular function to ensure we always have the latest state
  const handleFindDeals = async () => {
    if (ingredients.length === 0) return;
    
    // Reset states
    setIsLoading(true);
    setIsApiLoading(false);
    setError(null);
    setUnavailableIngredients([]);
    setAiThoughts([]);
    setSearchQueries([]);
    setCurrentAction('');

    try {
      // COMPLETELY NEW APPROACH: Create a fresh list of ingredients to search for
      // This will be a direct list that we'll send to the server
      
      // Step 1: Clear any previous search list
      setIngredientsToSearch([]);
      
      // Step 2: Create a new list of ingredients that need to be searched for
      const needToSearch: Ingredient[] = [];
      
      // AI thinking process - analyzing ingredients
      setCurrentAction('Analyzing recipe ingredients...');
      await new Promise(resolve => setTimeout(resolve, 800));
      addAiThought('Analyzing recipe ingredients for ' + recipeName);
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // Log all ingredients and their status
      // Get the current state directly from the state variable
      const currentUserHasIngredients = [...userHasIngredients];
      console.log('=== INGREDIENTS USER HAS ===');
      console.log(currentUserHasIngredients);
      console.log('===========================');
      
      // Step 3: Process each ingredient and decide whether to search for it
      const userHasItems: string[] = [];
      const basicItems: string[] = [];
      const searchItems: string[] = [];
      
      for (const ingredient of ingredients) {
        // Check if user has this ingredient (case-insensitive)
        const userHasIt = currentUserHasIngredients.some(item => 
          item.toLowerCase() === ingredient.name.toLowerCase()
        );
        
        // Check if it's a basic ingredient
        const isBasic = isBasicIngredient(ingredient.name);
        
        console.log(`Processing ${ingredient.name}: User has it: ${userHasIt}, Is basic: ${isBasic}`);
        
        if (userHasIt) {
          userHasItems.push(ingredient.name);
        } else if (isBasic) {
          basicItems.push(ingredient.name);
        } else {
          // This ingredient needs to be searched for
          needToSearch.push(ingredient);
          searchItems.push(ingredient.name);
        }
      }
      
      // Step 4: Log the results of our processing
      console.log('=== INGREDIENT CATEGORIZATION ===');
      console.log('User has:', userHasItems);
      console.log('Basic ingredients:', basicItems);
      console.log('Need to search for:', searchItems);
      console.log('================================');
      
      // Step 5: Update the AI thoughts to reflect our processing
      if (userHasItems.length > 0) {
        const message = `Skipping ${userHasItems.length} ingredients you already have: ${userHasItems.join(', ')}`;
        console.log(message);
        addAiThought(message);
        await new Promise(resolve => setTimeout(resolve, 800));
      }
      
      if (basicItems.length > 0) {
        const message = `Skipping ${basicItems.length} basic ingredients: ${basicItems.join(', ')}`;
        console.log(message);
        addAiThought(message);
        await new Promise(resolve => setTimeout(resolve, 800));
      }
      
      const searchMessage = `Found ${needToSearch.length} ingredients that need to be purchased: ${searchItems.join(', ')}`;
      console.log(searchMessage);
      addAiThought(searchMessage);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // If all ingredients are either basic or the user already has them, show a message
      if (needToSearch.length === 0) {
        const message = 'All ingredients are either basic kitchen items or already in your pantry!';
        console.log(message);
        addAiThought(message);
        await new Promise(resolve => setTimeout(resolve, 1200));
        setStatusMessage("You already have all the ingredients you need for this recipe!");
        setCart({});
        setStep('cart');
        setIsLoading(false);
        return;
      }
      
      // AI thinking - planning search strategy
      setCurrentAction('Planning search strategy...');
      addAiThought('Planning search strategy for optimal ingredient selection');
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      addAiThought(`Searching across ${platforms.length} platforms: ${platforms.join(', ')}`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Process each ingredient to search for
      for (const ingredient of needToSearch) {
        const searchMessage = `Searching for ${ingredient.name} (${ingredient.quantity})`;
        console.log(searchMessage);
        setCurrentAction(`Searching for ${ingredient.name}...`);
        addAiThought(searchMessage);
        
        // Simulate the API simplifying the ingredient name
        const simplifiedName = ingredient.name.split(' ')[0];
        console.log(`Adding search query for: ${ingredient.name} as ${simplifiedName}`);
        addSearchQuery(ingredient.name, simplifiedName);
        
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      setCurrentAction('Comparing prices and selecting best options...');
      addAiThought('Comparing prices and selecting best options for your shopping list');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Log the final list of ingredients being sent to the server
      console.log('Sending to server for search:', needToSearch.map(i => i.name));
      
      // IMPORTANT: Use our new needToSearch list instead of ingredientsToSearch
      // Call the server action to search for ingredient prices with the filtered list
      setIsApiLoading(true);
      setCurrentAction('Fetching ingredient prices from servers...');
      const result = await searchForIngredientPrices(needToSearch, platforms);
      setIsApiLoading(false);
      
      addAiThought('Finalizing shopping list with best available options');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check for unavailable ingredients in the message
      if (result.message) {
        setStatusMessage(result.message);
        
        // Extract unavailable ingredients from message if present
        const unavailableMatch = result.message.match(/Unable to find: ([^.]+)/);
        if (unavailableMatch && unavailableMatch[1]) {
          const missingItems = unavailableMatch[1].split(', ');
          setUnavailableIngredients(missingItems);
          
          if (missingItems.length > 0) {
            addAiThought(`Unable to find ${missingItems.length} ingredients: ${missingItems.join(', ')}`);
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }
      
      // Organize results by platform
      const newCart: Cart = {
        'Swiggy Instamart': [],
        'Zepto': [],
        'Blinkit': [],
        'Dunzo': [],
        'BigBasket': [],
        'BBNow': [],
        'DMart': [],
        'JioMart': []
      };
      
      // Group products by platform
      for (const product of result.results) {
        if (newCart[product.platform]) {
          // Ensure originalQuantity is set
          const productWithQuantity = {
            ...product,
            originalQuantity: product.originalQuantity || 'N/A'
          };
          newCart[product.platform].push(productWithQuantity);
        }
      }
      
      // Clear loading states before showing the cart
      setCurrentAction('');
      setCart(newCart);
      setStep('cart');
    } catch (err) {
      setError('Failed to find deals. Please try again.');
      console.error('Error finding deals:', err);
    } finally {
      setIsLoading(false);
      setIsApiLoading(false);
      setCurrentAction('');
    }
  };

  const calculateCartTotal = (platform: string) => {
    return (cart[platform] || []).reduce((sum, item) => sum + item.price, 0).toFixed(2);
  };

  const handleAddToCart = (platform: string) => {
    // In a real app, you would redirect to the platform's cart with the items
    const cartUrl = cart[platform]?.[0]?.url 
      ? `${cart[platform][0].url.split('/').slice(0, 3).join('/')}/cart`
      : '#';
    
    window.open(cartUrl, '_blank');
  };

  const AiThinkingProcess = () => {
    // Group thoughts into categories for citation-style display
    const thoughtCategories = {
      analysis: aiThoughts.filter(t => t.includes('Analyzing') || t.includes('Found')),
      planning: aiThoughts.filter(t => t.includes('Planning') || t.includes('strategy')),
      searching: aiThoughts.filter(t => t.includes('Searching')),
      comparison: aiThoughts.filter(t => t.includes('Comparing') || t.includes('Finalizing')),
      unavailable: aiThoughts.filter(t => t.includes('Unable to find')),
      other: aiThoughts.filter(t => {
        return !t.includes('Analyzing') && !t.includes('Found') && 
               !t.includes('Planning') && !t.includes('strategy') &&
               !t.includes('Searching') && !t.includes('Comparing') && 
               !t.includes('Finalizing') && !t.includes('Unable to find');
      })
    };
    
    return (
      <div className="mb-4 text-sm">
        {/* Current action with loading indicator */}
        {currentAction && (
          <div className="flex items-center mb-4 text-sm bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
            <Loader2 className={`h-4 w-4 ${isApiLoading ? 'animate-spin text-red-500' : 'animate-spin text-blue-500'} mr-2`} />
            <p className="font-medium">{currentAction}</p>
            {isApiLoading && <span className="ml-2 text-xs font-medium text-red-500 animate-pulse">API call in progress...</span>}
          </div>
        )}
        
        {/* ChatGPT-style message bubbles for AI thoughts */}
        <div className="space-y-4 mb-4">
          {/* Analysis thoughts */}
          {thoughtCategories.analysis.length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-start mb-2">
                <ChefHat className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">Recipe Analysis</p>
                  <div className="mt-2 space-y-2">
                    {thoughtCategories.analysis.map((thought, i) => (
                      <p key={i} className="text-gray-700 dark:text-gray-300">{thought}</p>
                    ))}
                  </div>
                  <div className="mt-2 flex items-center">
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                      <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-1"></span>
                      Recipe ingredient analysis
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Planning thoughts */}
          {thoughtCategories.planning.length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-start mb-2">
                <ChefHat className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">Search Strategy</p>
                  <div className="mt-2 space-y-2">
                    {thoughtCategories.planning.map((thought, i) => (
                      <p key={i} className="text-gray-700 dark:text-gray-300">{thought}</p>
                    ))}
                  </div>
                  <div className="mt-2 flex items-center">
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                      <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-1"></span>
                      Platform selection and search planning
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Search queries with citations */}
          {searchQueries.length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-start">
                <ChefHat className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2 mt-0.5" />
                <div className="w-full">
                  <p className="font-medium text-gray-900 dark:text-gray-100">Search Queries</p>
                  <div className="mt-2 space-y-3 max-h-60 overflow-y-auto">
                    {searchQueries.map((query, i) => (
                      <div key={i} className="border-t border-gray-200 dark:border-gray-700 pt-2">
                        <p className="text-gray-700 dark:text-gray-300">
                          Searching for <span className="font-medium">{query.original}</span> as <span className="font-medium text-blue-600 dark:text-blue-400">{query.simplified}</span>
                        </p>
                        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 flex items-start">
                          <span className="inline-block w-3 h-3 bg-amber-500 rounded-full mr-1 mt-0.5"></span>
                          <span>
                            API call: <code className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded text-xs break-all">
                              /query={encodeURIComponent(query.simplified)}
                            </code>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Comparison thoughts */}
          {thoughtCategories.comparison.length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-start mb-2">
                <ChefHat className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">Price Comparison</p>
                  <div className="mt-2 space-y-2">
                    {thoughtCategories.comparison.map((thought, i) => (
                      <p key={i} className="text-gray-700 dark:text-gray-300">{thought}</p>
                    ))}
                  </div>
                  <div className="mt-2 flex items-center">
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                      <span className="inline-block w-3 h-3 bg-purple-500 rounded-full mr-1"></span>
                      Product selection algorithm
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Unavailable ingredients */}
          {thoughtCategories.unavailable.length > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-700">
              <div className="flex items-start mb-2">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mr-2 mt-0.5" />
                <div>
                  <p className="font-medium text-red-900 dark:text-red-100">Unavailable Items</p>
                  <div className="mt-2 space-y-2">
                    {thoughtCategories.unavailable.map((thought, i) => (
                      <p key={i} className="text-red-700 dark:text-red-300">{thought}</p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Other thoughts */}
          {thoughtCategories.other.length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-start mb-2">
                <ChefHat className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">Additional Information</p>
                  <div className="mt-2 space-y-2">
                    {thoughtCategories.other.map((thought, i) => (
                      <p key={i} className="text-gray-700 dark:text-gray-300">{thought}</p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-6">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-lg font-medium">Finding required ingredients for the recipe...</p>
        <p className="text-sm text-gray-500 mt-2">This may take a moment</p>
        
        {/* AI Thinking Process */}
        <div className="w-full max-w-xl mt-6 border rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
          <div className="flex items-center mb-3">
            <ChefHat className="h-5 w-5 text-blue-500 mr-2" />
            <h3 className="font-medium text-blue-600 dark:text-blue-400">AI Assistant</h3>
          </div>
          <AiThinkingProcess />
        </div>
      </div>
    );
  }

  if (step === 'input') {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <ChefHat className="h-5 w-5 text-orange-500" />
          <h3 className="text-lg font-medium">What would you like to cook?</h3>
        </div>
        
        <div className="flex space-x-2">
          <input
            type="text"
            value={recipeName}
            onChange={(e) => setRecipeName(e.target.value)}
            placeholder="e.g., Margherita Pizza"
            className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            onKeyDown={(e) => e.key === 'Enter' && handleFindRecipe()}
          />
          <Button 
            onClick={handleFindRecipe}
            disabled={isLoading}
            className="bg-orange-500 hover:bg-orange-600"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Find Recipe'}
          </Button>
        </div>
        
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    );
  }

  if (step === 'ingredients') {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-2">Ingredients for {recipeName}</h3>
          <p className="text-sm text-gray-500 mb-4">Check the ingredients you already have at home. We'll only search for the ones you need.</p>
          <ul className="space-y-3">
            {ingredients.map((ingredient, i) => (
              <li key={i} className="flex items-center">
                <div className="flex items-center mr-2">
                  <input
                    type="checkbox"
                    id={`ingredient-${i}`}
                    checked={userHasIngredients.includes(ingredient.name)}
                    onChange={() => toggleUserHasIngredient(ingredient.name)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>
                <label htmlFor={`ingredient-${i}`} className="flex items-center flex-1 cursor-pointer">
                  <span className="font-medium">{ingredient.name}</span>
                  <span className="text-sm text-gray-500 ml-2">({ingredient.quantity})</span>
                  {isBasicIngredient(ingredient.name) && (
                    <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                      Basic ingredient
                    </span>
                  )}
                </label>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="space-y-3">
          <p className="font-medium">Select platforms to compare prices:</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(PLATFORM_NAMES).map(([key, name]) => (
              <button
                key={key}
                onClick={() => togglePlatform(key as Platform)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  platforms.includes(key as Platform)
                    ? `${PLATFORM_COLORS[key as keyof typeof PLATFORM_COLORS]} border border-transparent`
                    : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex justify-between pt-4">
          <Button 
            variant="outline" 
            onClick={() => setStep('input')}
            disabled={isLoading}
          >
            Back
          </Button>
          <Button 
            onClick={handleFindDeals}
            disabled={isLoading || platforms.length === 0}
            className="bg-orange-500 hover:bg-orange-600"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Finding Deals...
              </>
            ) : (
              <>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Find Best Deals
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  if (step === 'cart') {
    // Filter out platforms with no products
    const activePlatforms = Object.entries(cart)
      .filter(([_, products]) => products.length > 0)
      .map(([platform]) => platform as Platform);
    
    // Calculate total price for each platform
    const platformTotals: Record<string, { price: number, deliveryFee: number, platformFee: number, minOrderValue: number }> = {};
    
    for (const platform of activePlatforms) {
      const products = cart[platform] || [];
      const totalPrice = products.reduce((sum, product) => sum + product.price, 0);
      const firstProduct = products[0];
      
      platformTotals[platform] = {
        price: totalPrice,
        deliveryFee: firstProduct?.deliveryFee || 0,
        platformFee: firstProduct?.platformFee || 0,
        minOrderValue: firstProduct?.minOrderValue || 0
      };
    }
    
    // Check if we have any unavailable ingredients to display
    const hasUnavailableIngredients = unavailableIngredients.length > 0;
    
    // Get list of ingredients the user already has
    const userHasIngredientsList = ingredients.filter(ing => userHasIngredients.includes(ing.name));
    
    // Get list of basic ingredients
    const basicIngredientsList = ingredients.filter(ing => isBasicIngredient(ing.name) && !userHasIngredients.includes(ing.name));
    
    // Check if we have any products to display
    const hasProducts = activePlatforms.length > 0;
    
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-4">Shopping List for {recipeName}</h3>
          
          {/* AI Thinking Process (collapsed in results view) */}
          {aiThoughts.length > 0 && (
            <details className="mb-6 border rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
              <summary className="font-medium cursor-pointer">AI Processing Details</summary>
              <div className="mt-4">
                <AiThinkingProcess />
              </div>
            </details>
          )}
          
          {/* Ingredient Summary Section */}
          <div className="mb-6 border rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
            <h4 className="font-medium mb-3">Ingredient Summary</h4>
            
            {userHasIngredientsList.length > 0 && (
              <div className="mb-3">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">You already have:</p>
                <ul className="list-disc pl-5 text-sm text-gray-600 dark:text-gray-400">
                  {userHasIngredientsList.map((ing, i) => (
                    <li key={i}>{ing.name} ({ing.quantity})</li>
                  ))}
                </ul>
              </div>
            )}
            
            {basicIngredientsList.length > 0 && (
              <div className="mb-3">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Basic ingredients (assumed you have):</p>
                <ul className="list-disc pl-5 text-sm text-gray-600 dark:text-gray-400">
                  {basicIngredientsList.map((ing, i) => (
                    <li key={i}>{ing.name} ({ing.quantity})</li>
                  ))}
                </ul>
              </div>
            )}
            
            {hasUnavailableIngredients && (
              <div className="mb-3">
                <p className="text-sm font-medium text-amber-700 dark:text-amber-400 mb-1">Not available on selected platforms:</p>
                <ul className="list-disc pl-5 text-sm text-amber-600 dark:text-amber-400">
                  {unavailableIngredients.map((ingredient, i) => (
                    <li key={i}>{ingredient}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          {statusMessage && !hasProducts && (
            <div className="flex items-center p-4 mb-4 text-blue-800 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 rounded-lg">
              <Info className="h-5 w-5 mr-2 flex-shrink-0" />
              <p>{statusMessage}</p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {platforms.map(platform => {
              const platformCart = cart[platform] || [];
              const total = calculateCartTotal(platform);
              const hasPlatformItems = platformCart.length > 0;
              
              return (
                <div 
                  key={platform} 
                  className={`border rounded-lg p-4 dark:border-gray-700 ${!hasPlatformItems ? 'opacity-60' : ''}`}
                >
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium">{PLATFORM_NAMES[platform]}</h4>
                    <span className="px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-sm">
                      ₹{total}
                    </span>
                  </div>
                  
                  <div className="space-y-3 mb-4 max-h-60 overflow-y-auto pr-2">
                    {platformCart.length > 0 ? (
                      platformCart.map((item, i) => (
                        <div key={i} className="flex items-start space-x-3">
                          <div className="flex-shrink-0 w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded overflow-hidden relative">
                            {item.image && item.image !== 'N/A' && item.image.startsWith('http') ? (
                              <Image 
                                src={item.image} 
                                alt={item.name} 
                                fill
                                className="object-contain p-1.5"
                                sizes="64px"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  const placeholderImage = `https://placehold.co/100x100.png`;
                                  if (target.src !== placeholderImage) {
                                    target.src = placeholderImage;
                                  }
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ShoppingCart className="h-4 w-4 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            {item.url ? (
                              <a 
                                href={item.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-sm font-medium truncate text-blue-600 hover:text-blue-800 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
                              >
                                {item.name}
                              </a>
                            ) : (
                              <p className="text-sm font-medium truncate">{item.name}</p>
                            )}
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {item.brand && <span className="font-medium">{item.brand} • </span>}
                              {item.quantity || item.originalQuantity} • ₹{item.price.toFixed(2)}
                            </p>
                            {item.url && (
                              <p className="text-xs mt-1">
                                <a 
                                  href={item.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 hover:underline dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
                                >
                                  <span>View on {PLATFORM_NAMES[item.platform]}</span>
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                  </svg>
                                </a>
                              </p>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 text-center py-4">
                        No items found on {PLATFORM_NAMES[platform]}
                      </p>
                    )}
                  </div>
                  
                  <Button 
                    size="sm" 
                    className="w-full"
                    onClick={() => handleAddToCart(platform)}
                    disabled={platformCart.length === 0}
                    variant={hasPlatformItems ? "default" : "outline"}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Add to {PLATFORM_NAMES[platform]} Cart
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="flex justify-between pt-4">
          <Button 
            variant="outline" 
            onClick={() => setStep('ingredients')}
            disabled={isLoading}
          >
            Back to Ingredients
          </Button>
          <Button 
            variant="outline"
            onClick={() => setStep('input')}
          >
            Start Over
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
