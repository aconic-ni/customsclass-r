'use server';

import { predictHsCode, type PredictHsCodeInput, type PredictHsCodeOutput } from '@/ai/flows/predict-hs-code';
import { explainHsCode, type ExplainHsCodeOutput } from '@/ai/flows/explain-hs-code';
import { z } from 'zod';

const formSchema = z.object({
  brand: z.string().min(1, 'Brand is required.'),
  description: z.string().min(10, 'Description must be at least 10 characters long.'),
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
    return { success: false, error: 'An unexpected error occurred. Please try again.' };
  }
}
