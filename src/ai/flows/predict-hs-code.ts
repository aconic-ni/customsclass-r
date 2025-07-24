'use server';

/**
 * @fileOverview A flow to predict the HS code for a product based on its brand and description.
 *
 * - predictHsCode - A function that handles the HS code prediction process.
 * - PredictHsCodeInput - The input type for the predictHsCode function.
 * - PredictHsCodeOutput - The return type for the predictHsCode function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PredictHsCodeInputSchema = z.object({
  brand: z.string().describe('The brand of the product.'),
  description: z.string().describe('A detailed description of the product.'),
});
export type PredictHsCodeInput = z.infer<typeof PredictHsCodeInputSchema>;

const PredictHsCodeOutputSchema = z.object({
  hsCode: z.string().describe('The predicted HS code classification for the product.'),
  explanation: z.string().describe('A brief explanation justifying the predicted classification.'),
});
export type PredictHsCodeOutput = z.infer<typeof PredictHsCodeOutputSchema>;

export async function predictHsCode(input: PredictHsCodeInput): Promise<PredictHsCodeOutput> {
  return predictHsCodeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictHsCodePrompt',
  input: {schema: PredictHsCodeInputSchema},
  output: {schema: PredictHsCodeOutputSchema},
  prompt: `You are an AI assistant specialized in predicting the Harmonized System (HS) code for products based on their brand and description.

  Given the following brand and product description, predict the most appropriate HS code classification and provide a brief explanation justifying your prediction.

  Brand: {{{brand}}}
  Description: {{{description}}}

  Respond with a JSON object:
  {
    "hsCode": "<predicted HS code>",
    "explanation": "<brief explanation>"
  }`,
});

const predictHsCodeFlow = ai.defineFlow(
  {
    name: 'predictHsCodeFlow',
    inputSchema: PredictHsCodeInputSchema,
    outputSchema: PredictHsCodeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
