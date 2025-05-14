
'use server';

/**
 * @fileOverview This file defines a Genkit flow for providing smart savings suggestions based on the user's cart.
 * It considers item prices, potential platform fees, delivery costs, and minimum order value (MOV) manipulations.
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
  quantity: z.string().describe('The quantity description of one unit of the product (e.g., "1kg", "500ml", "1 dozen").'),
  price: z.number().describe('The price of one unit of the product.'),
  platform: z.string().describe('The platform where the product is available (e.g., Swiggy, Zepto).'),
  cartQuantity: z.number().describe('The number of units of this product in the cart.'),
});

const SavingsSuggestionInputSchema = z.object({
  cartItems: z.array(CartItemSchema).describe('The items currently in the user\'s cart.'),
  // Optionally, pass current total cart value if needed for more precise MOV checks by AI, though AI can also infer.
  // currentCartTotalValue: z.number().optional().describe('The total value of items currently in the cart.'), 
});
export type SavingsSuggestionInput = z.infer<typeof SavingsSuggestionInputSchema>;

const SuggestionTypeSchema = z.enum(['cost', 'mov_alert', 'convenience', 'fee_optimization']);

const SavingsSuggestionSchema = z.object({
  suggestion: z.string().describe('A specific, actionable suggestion for saving money or optimizing the current cart.'),
  estimatedSavings: z.number().describe('The estimated amount of money the user would save by following this suggestion. Can be 0 if it\'s a general tip or alert.'),
  type: SuggestionTypeSchema.optional().describe('The category of the suggestion (e.g., cost saving, MOV alert, fee optimization).'),
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
  prompt: `You are SaveIT.io's expert savings advisor. Your goal is to provide actionable insights for the user's grocery cart, considering item prices, potential delivery fees, platform fees, and minimum order value (MOV) tactics.

User's Cart:
{{#each cartItems}}
- {{cartQuantity}} x {{brand}} {{name}} ({{quantity}}) from {{platform}} @ ₹{{price}} each
{{/each}}

Known Quick Commerce Platform Characteristics (General Knowledge - Assume these unless item data strongly contradicts):
- Swiggy Instamart, Zepto, Blinkit: Fast delivery, often have delivery/platform fees. MOVs can start low (e.g., ₹99-₹199) but might increase for users over time (e.g. to ₹299-₹499).
- DMart Ready, BigBasket, Jiomart: Potentially lower item prices for bulk, may have higher MOVs for free delivery, delivery might be slower.

Please provide a list of 3-5 high-quality savings suggestions. For each suggestion:
1.  Clearly describe the action.
2.  Estimate monetary savings if applicable (can be 0 for alerts/general tips).
3.  Specify the suggestion type (cost, mov_alert, convenience, fee_optimization).

Consider these strategies:
*   **Platform Fee Optimization**: If items are spread across multiple fast-delivery platforms, suggest consolidating to one to reduce cumulative delivery/platform fees. (e.g., "Consider moving items from Zepto to your Swiggy order to save on one set of platform/delivery fees.") Type: 'fee_optimization'.
*   **MOV Alerts & Strategies**:
    *   If the cart total on a platform is just below its typical MOV (e.g., ₹170 on a ₹199 MOV platform), alert the user they might be prompted to add more. Suggest checking if a slightly cheaper item exists to meet MOV or if it's better to pay the small-order fee if available. (e.g., "Your Swiggy subtotal is close to their usual ₹199 minimum. You might be charged a small order fee or prompted to add more. See if a small essential item bridges the gap, or if paying the fee is cheaper than buying unneeded items."). Type: 'mov_alert'.
    *   Warn if a user seems to be adding items *just* to meet a high MOV, especially if those items are not on their typical shopping list (requires history, but can be a general warning). (e.g., "Alert: Adding low-priority items just to meet a high minimum order value can lead to overspending. Double-check if you really need them."). Type: 'mov_alert'.
*   **Cheaper Platform Alternatives (Holistic)**: If an item or the whole cart could be significantly cheaper on another platform *after considering potential fees and MOV*. (e.g., "Staples like rice and flour are often cheaper on BigBasket or DMart if you can meet their MOV and wait for scheduled delivery. This could save ~₹{{amount}} on those items."). Type: 'cost'.
*   **Equivalent Product Alternatives**: Suggest cheaper, equivalent brands or sizes. (e.g., "Switching to Brand X for [Product Y] could save you ₹{{amount}}."). Type: 'cost'.
*   **Bundle Deals (General Tip)**: "Check if [Platform X] offers bundle deals for items already in your cart, or if adding a related item unlocks a discount." Type: 'cost'.

Prioritize actionable advice that leads to real savings or avoids overspending. Be concise.

Output format: An array of suggestions, each with 'suggestion', 'estimatedSavings', and 'type'.
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
    if (output && output.suggestions) {
        return output;
    }
    // Fallback to empty suggestions if AI output is problematic
    return { suggestions: [] };
  }
);
