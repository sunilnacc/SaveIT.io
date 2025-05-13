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
  quantity: z.string().describe('The quantity of the product (e.g., "1kg", "500ml", "2 x 1 dozen").'),
  price: z.number().describe('The price of one unit of the product.'),
  platform: z.string().describe('The platform where the product is available (e.g., Swiggy, Zepto).'),
});

const SavingsSuggestionInputSchema = z.object({
  cartItems: z.array(CartItemSchema).describe('The items currently in the user\'s cart.'),
});
export type SavingsSuggestionInput = z.infer<typeof SavingsSuggestionInputSchema>;

const SavingsSuggestionSchema = z.object({
  suggestion: z.string().describe('A specific, actionable suggestion for saving money on the current cart.'),
  estimatedSavings: z.number().describe('The estimated amount of money the user would save by following this suggestion. Can be 0 if it\'s a general tip without direct quantifiable savings for a specific item.'),
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
  prompt: `You are an expert grocery savings advisor, the "SaveIT.io Assistant". Your goal is to provide actionable and insightful savings suggestions for the user's current grocery cart.

User's Cart:
{{#each cartItems}}
- {{quantity}} of {{brand}} {{name}} (from {{platform}}) @ ₹{{price}} each
{{/each}}

Please provide a list of savings suggestions. For each suggestion:
1.  Clearly describe the suggested action (e.g., "Switch to Platform X for Item Y", "Consider Store Brand Z for Item A", "Bundle items B and C on Platform P for potential delivery savings or meeting order minimums").
2.  Estimate the monetary savings if the user follows the suggestion. If it's a general tip without direct savings on a specific item (like bundling for delivery), savings can be 0 but explain the potential benefit.
3.  Prioritize suggestions that offer significant savings or convenience.

Consider these strategies:
*   **Cheaper Platforms:** Identify if any cart items are available cheaper on other known grocery platforms (e.g., if an item is on Swiggy, consider if Zepto, Blinkit, BBNow, DMart might have it cheaper - you don't have live prices for them, but can suggest based on general knowledge if an item is commonly cheaper elsewhere or if a platform is known for specific categories).
*   **Equivalent Alternatives:** Suggest cheaper, equivalent brand alternatives if available (e.g., a different well-known brand of the same product type and size that's often more economical).
*   **Store Brands:** If a significantly cheaper store brand equivalent likely exists for a product (e.g., for staples like flour, sugar, pulses), suggest checking for it as an option.
*   **Bundle Deals/Platform Consolidation:** If buying multiple items from a single alternative platform could lead to overall savings (e.g., by meeting a free delivery threshold, or if a platform offers bundle discounts). You do not have specific delivery fee data, so frame this as a general tip to check.
*   **Slightly Different Quantities/Pack Sizes:** If a slightly larger or smaller pack size of the SAME product often offers better value per unit (e.g., buying a 5kg bag of rice vs. five 1kg bags), mention this as a possibility.
*   **Focus on High-Impact Suggestions:** If there are many small potential savings, try to group them or focus on the ones with the most impact.

Be concise and actionable. Limit to 3-5 high-quality suggestions.

Output format:
- An array of suggestions, each with a 'suggestion' string and 'estimatedSavings' number.
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
    // Ensure output is not null and suggestions array exists
    if (output &amp;&amp; output.suggestions) {
        return output;
    }
    // Fallback to empty suggestions if AI output is problematic
    return { suggestions: [] };
  }
);
