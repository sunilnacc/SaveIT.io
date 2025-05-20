import { NextRequest, NextResponse } from 'next/server';
import { findRecipeIngredients, searchIngredientPrices, recipeShoppingFlow } from '@/ai/flows/recipe-shopping';

export async function POST(request: NextRequest) {
  try {
    const { action, data } = await request.json();
    
    switch (action) {
      case 'findRecipeIngredients':
        const recipeResult = await findRecipeIngredients(data);
        return NextResponse.json(recipeResult);
        
      case 'searchIngredientPrices':
        const searchResult = await searchIngredientPrices(data);
        return NextResponse.json(searchResult);
        
      case 'recipeShoppingFlow':
        const flowResult = await recipeShoppingFlow(data);
        return NextResponse.json(flowResult);
        
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Recipe API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
