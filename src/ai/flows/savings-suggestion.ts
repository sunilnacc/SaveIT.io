'use server';

/**
 * @fileOverview This file defines a Genkit flow for providing smart savings suggestions based on the user's cart.
 *
 * - getSavingsSuggestions - A function that takes a cart and returns savings suggestions.
 * - SavingsSuggestionInput - The input type for the getSavingsSuggestions function.
 * - SavingsSuggestionOutput - The return type for the getSavingsSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CartItemSchema = z.object({
  name: z.string().describe('The name of the product.'),
  brand: z.string().describe('The brand of the product.'),
  quantity: z.string().describe('The quantity of the product.'),
  price: z.number().describe('The price of the product.'),
  platform: z.string().describe('The platform where the product is available (e.g., Swiggy, Zepto).'),
});

const SavingsSuggestionInputSchema = z.object({
  cartItems: z.array(CartItemSchema).describe('The items currently in the user\'s cart.'),
});
export type SavingsSuggestionInput = z.infer<typeof SavingsSuggestionInputSchema>;

const SavingsSuggestionSchema = z.object({
  suggestion: z.string().describe('A suggestion for saving money on the current cart, such as alternative platforms or products.'),
  estimatedSavings: z.number().describe('The estimated amount of money the user would save by following this suggestion.'),
});

const SavingsSuggestionOutputSchema = z.object({
  suggestions: z.array(SavingsSuggestionSchema).describe('An array of savings suggestions for the user\'s cart.'),
});
export type SavingsSuggestionOutput = z.infer<typeof SavingsSuggestionOutputSchema>;

export async function getSavingsSuggestions(input: SavingsSuggestionInput): Promise<SavingsSuggestionOutput> {
  return savingsSuggestionFlow(input);
}

const savingsSuggestionPrompt = ai.definePrompt({
  name: 'savingsSuggestionPrompt',
  input: {schema: SavingsSuggestionInputSchema},
  output: {schema: SavingsSuggestionOutputSchema},
  prompt: `You are a savvy shopping assistant that helps users find the best deals and save money on their grocery purchases.

  Based on the items in the user's cart, suggest alternative platforms or slightly different products that are cheaper.
  Be specific in your suggestions and provide the estimated savings.

  Here are the items in the user's cart:
  {{#each cartItems}}
  - {{quantity}} of {{brand}} {{name}} from {{platform}} at ₹{{price}}
  {{/each}}
  
  Give a list of savings suggestions, with each including the estimated savings.
  `,
});

const savingsSuggestionFlow = ai.defineFlow(
  {
    name: 'savingsSuggestionFlow',
    inputSchema: SavingsSuggestionInputSchema,
    outputSchema: SavingsSuggestionOutputSchema,
  },
  async input => {
    const {output} = await savingsSuggestionPrompt(input);
    return output!;
  }
);
