'use server';
/**
 * @fileOverview An AI agent that determines if two products from different platforms are equivalent.
 *
 * - checkProductEquivalency - A function that checks if two products are equivalent.
 * - ProductEquivalencyInput - The input type for the checkProductEquivalency function.
 * - ProductEquivalencyOutput - The return type for the checkProductEquivalency function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProductSchema = z.object({
  name: z.string().describe('The name of the product.'),
  brand: z.string().optional().describe('The brand of the product.'),
  quantity: z.string().optional().describe('The quantity of the product.'),
});

const ProductEquivalencyInputSchema = z.object({
  product1: ProductSchema.describe('The first product.'),
  product2: ProductSchema.describe('The second product.'),
});

export type ProductEquivalencyInput = z.infer<typeof ProductEquivalencyInputSchema>;

const ProductEquivalencyOutputSchema = z.object({
  equivalent: z
    .boolean()
    .describe('Whether the two products are equivalent or not.'),
  reason: z
    .string()
    .describe('The reasoning behind the equivalency determination.'),
});

export type ProductEquivalencyOutput = z.infer<typeof ProductEquivalencyOutputSchema>;

export async function checkProductEquivalency(
  input: ProductEquivalencyInput
): Promise<ProductEquivalencyOutput> {
  return productEquivalencyFlow(input);
}

const productEquivalencyPrompt = ai.definePrompt({
  name: 'productEquivalencyPrompt',
  input: {schema: ProductEquivalencyInputSchema},
  output: {schema: ProductEquivalencyOutputSchema},
  prompt: `You are an expert product comparison agent.

You will determine if two products are equivalent, even if their names are slightly different.
Consider brand, quantity, and other relevant factors.

Product 1: {{{product1}}}
Product 2: {{{product2}}}

Determine if the two products are equivalent and provide a reason for your determination.
Set the 'equivalent' field to true if they are equivalent, and false if they are not.
`,
});

const productEquivalencyFlow = ai.defineFlow(
  {
    name: 'productEquivalencyFlow',
    inputSchema: ProductEquivalencyInputSchema,
    outputSchema: ProductEquivalencyOutputSchema,
  },
  async input => {
    const {output} = await productEquivalencyPrompt(input);
    return output!;
  }
);
