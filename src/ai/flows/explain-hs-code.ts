'use server';

/**
 * @fileOverview Explains the reasoning behind an HS code classification.
 *
 * - explainHsCode - A function that generates an explanation for a given HS code.
 * - ExplainHsCodeInput - The input type for the explainHsCode function.
 * - ExplainHsCodeOutput - The return type for the explainHsCode function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExplainHsCodeInputSchema = z.object({
  brand: z.string().describe('The brand of the product.'),
  productDescription: z.string().describe('A detailed description of the product.'),
  hsCode: z.string().describe('The predicted HS code for the product.'),
});
export type ExplainHsCodeInput = z.infer<typeof ExplainHsCodeInputSchema>;

const ExplainHsCodeOutputSchema = z.object({
  explanation: z.string().describe('A brief, retro-styled explanation justifying the HS code classification.'),
});
export type ExplainHsCodeOutput = z.infer<typeof ExplainHsCodeOutputSchema>;

export async function explainHsCode(input: ExplainHsCodeInput): Promise<ExplainHsCodeOutput> {
  return explainHsCodeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'explainHsCodePrompt',
  input: {schema: ExplainHsCodeInputSchema},
  output: {schema: ExplainHsCodeOutputSchema},
  prompt: `You are an AI assistant specialized in explaining HS code classifications in a retro style.

  Given the following product information and predicted HS code, provide a brief explanation justifying the classification. The explanation should be easy to understand and have a slightly retro, old-fashioned tone, as if it were printed in an old catalog.

  Brand: {{{brand}}}
  Product Description: {{{productDescription}}}
  HS Code: {{{hsCode}}}

  Explanation:`,
});

const explainHsCodeFlow = ai.defineFlow(
  {
    name: 'explainHsCodeFlow',
    inputSchema: ExplainHsCodeInputSchema,
    outputSchema: ExplainHsCodeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
