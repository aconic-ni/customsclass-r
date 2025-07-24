'use server';

import { predictHsCode, type PredictHsCodeInput, type PredictHsCodeOutput } from '@/ai/flows/predict-hs-code';
import { explainHsCode, type ExplainHsCodeOutput } from '@/ai/flows/explain-hs-code';
import { z } from 'zod';

const formSchema = z.object({
  brand: z.string(),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres.'),
});

export type ResultData = {
  prediction: PredictHsCodeOutput;
  explanation: ExplainHsCodeOutput;
}

export type ActionResponse = {
  success: true;
  data: ResultData;
} | {
  success: false;
  error: string;
};

export async function getHsCodePrediction(data: PredictHsCodeInput): Promise<ActionResponse> {
  const validation = formSchema.safeParse(data);
  if (!validation.success) {
    const error = validation.error.errors.map(e => e.message).join(', ');
    return { success: false, error };
  }

  try {
    const { brand, description } = data;

    const prediction = await predictHsCode({ brand, description });

    const explanation = await explainHsCode({
      brand,
      productDescription: description,
      hsCode: prediction.hsCode,
    });

    return { success: true, data: { prediction, explanation } };
  } catch (e) {
    console.error(e);
    return { success: false, error: 'Ocurrió un error inesperado. Por favor, inténtalo de nuevo.' };
  }
}
