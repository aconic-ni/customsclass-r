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
  brand: z.string().describe('The brand of the product. Can be empty.'),
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
  prompt: `Eres un asistente de IA especializado en explicar clasificaciones de códigos HS en un estilo retro.

  Dada la siguiente información del producto y el código HS predicho, proporciona una breve explicación que justifique la clasificación. La explicación debe ser fácil de entender y tener un tono ligeramente retro y anticuado, como si estuviera impresa en un catálogo antiguo.

  {{#if brand}}Marca: {{{brand}}}{{else}}Marca: No especificada{{/if}}
  Descripción del producto: {{{productDescription}}}
  Código HS: {{{hsCode}}}

  Explicación:`,
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
