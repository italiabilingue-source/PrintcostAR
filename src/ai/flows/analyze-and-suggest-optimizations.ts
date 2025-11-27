'use server';
/**
 * @fileOverview Analyzes cost estimations and suggests optimizations to reduce costs.
 *
 * - analyzeAndSuggestOptimizations - A function that analyzes cost estimations and suggests optimizations.
 * - AnalyzeAndSuggestOptimizationsInput - The input type for the analyzeAndSuggestOptimizations function.
 * - AnalyzeAndSuggestOptimizationsOutput - The return type for the analyzeAndSuggestOptimizations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeAndSuggestOptimizationsInputSchema = z.object({
  costEstimationDetails: z.string().describe('Detailed information about the cost estimation, including material cost, print time, electricity consumption, labor, printer depreciation, post-processing costs, and desired profit margin.'),
});
export type AnalyzeAndSuggestOptimizationsInput = z.infer<typeof AnalyzeAndSuggestOptimizationsInputSchema>;

const AnalyzeAndSuggestOptimizationsOutputSchema = z.object({
  optimizationSuggestions: z.string().describe('Suggestions for optimizing the cost estimation to reduce costs and improve profitability, such as using different materials or optimizing print settings.'),
});
export type AnalyzeAndSuggestOptimizationsOutput = z.infer<typeof AnalyzeAndSuggestOptimizationsOutputSchema>;

export async function analyzeAndSuggestOptimizations(input: AnalyzeAndSuggestOptimizationsInput): Promise<AnalyzeAndSuggestOptimizationsOutput> {
  return analyzeAndSuggestOptimizationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeAndSuggestOptimizationsPrompt',
  input: {schema: AnalyzeAndSuggestOptimizationsInputSchema},
  output: {schema: AnalyzeAndSuggestOptimizationsOutputSchema},
  prompt: `Analyze the following 3D printing cost estimation details and suggest optimizations to reduce costs and improve profitability. Consider factors like material cost, print time, electricity consumption, labor, printer depreciation, post-processing costs, and desired profit margin.\n\nCost Estimation Details: {{{costEstimationDetails}}}`,
});

const analyzeAndSuggestOptimizationsFlow = ai.defineFlow(
  {
    name: 'analyzeAndSuggestOptimizationsFlow',
    inputSchema: AnalyzeAndSuggestOptimizationsInputSchema,
    outputSchema: AnalyzeAndSuggestOptimizationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
