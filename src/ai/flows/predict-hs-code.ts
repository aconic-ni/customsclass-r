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
  prompt: `Eres un asistente de IA especializado en predecir el código del Sistema Armonizado (HS) para productos basándose en su marca y descripción.

  Dada la siguiente marca y descripción del producto, predice la clasificación del código HS más apropiada y proporciona una breve explicación que justifique tu predicción.

  Marca: {{{brand}}}
  Descripción: {{{description}}}

  Responde con un objeto JSON:
  {
    "hsCode": "<código HS predicho>",
    "explanation": "<breve explicación>"
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
