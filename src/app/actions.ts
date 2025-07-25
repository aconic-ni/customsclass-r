'use server';

import { predictHsCode, type PredictHsCodeInput, type PredictHsCodeOutput } from '@/ai/flows/predict-hs-code';
import { explainHsCode, type ExplainHsCodeOutput } from '@/ai/flows/explain-hs-code';
import { z } from 'zod';
import { saveHistoryItem } from '@/services/firestore';

const formSchema = z.object({
  brand: z.string(),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres.'),
  userId: z.string(),
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

export async function getHsCodePrediction(data: PredictHsCodeInput & { userId: string }): Promise<ActionResponse> {
  const validation = formSchema.safeParse(data);
  if (!validation.success) {
    const error = validation.error.errors.map(e => e.message).join(', ');
    return { success: false, error };
  }

  try {
    const { brand, description, userId } = data;

    const prediction = await predictHsCode({ brand, description });

    const explanation = await explainHsCode({
      brand,
      productDescription: description,
      hsCode: prediction.hsCode,
    });

    const result = { prediction, explanation };

    await saveHistoryItem({
      userId,
      brand,
      description,
      result
    });

    return { success: true, data: result };
  } catch (e) {
    console.error(e);
    return { success: false, error: 'Ocurrió un error inesperado. Por favor, inténtalo de nuevo.' };
  }
}
