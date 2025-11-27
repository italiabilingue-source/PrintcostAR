'use server';

/**
 * @fileOverview This file defines a Genkit flow that takes a user prompt describing a 3D print job and uses AI to pre-populate cost estimation fields with reasonable estimates.
 *
 * @exports generateEstimatesFromPrompt - An async function that accepts a prompt and returns a JSON object containing estimated cost parameters.
 * @exports EstimatesInput - The input type for the generateEstimatesFromPrompt function.
 * @exports EstimatesOutput - The output type for the generateEstimatesFromPrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EstimatesInputSchema = z.object({
  prompt: z.string().describe('A description of the 3D print job.'),
});
export type EstimatesInput = z.infer<typeof EstimatesInputSchema>;

const EstimatesOutputSchema = z.object({
  materialCost: z.number().describe('Estimated cost of the material used for printing.'),
  printingTimeHours: z.number().describe('Estimated printing time in hours.'),
  electricityCost: z.number().describe('Estimated cost of electricity consumption during printing.'),
  laborCost: z.number().describe('Estimated labor cost for the print job.'),
  printerDepreciation: z.number().describe('Estimated depreciation cost of the printer for the print job.'),
  postProcessingCost: z.number().describe('Estimated post-processing costs.'),
  profitMargin: z.number().describe('Desired profit margin for the print job.'),
  currency: z.string().describe('The currency to use for the cost estimates.'),
});
export type EstimatesOutput = z.infer<typeof EstimatesOutputSchema>;

export async function generateEstimatesFromPrompt(input: EstimatesInput): Promise<EstimatesOutput> {
  return generateEstimatesFromPromptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateEstimatesPrompt',
  input: {schema: EstimatesInputSchema},
  output: {schema: EstimatesOutputSchema},
  prompt: `You are an expert in 3D printing cost estimation. Based on the user's description of the 3D print job, provide reasonable estimates for the following cost parameters in JSON format. Use USD as the default currency.

Description: {{{prompt}}}

Cost Parameters:
- materialCost: Estimated cost of the material used for printing.
- printingTimeHours: Estimated printing time in hours.
- electricityCost: Estimated cost of electricity consumption during printing.
- laborCost: Estimated labor cost for the print job.
- printerDepreciation: Estimated depreciation cost of the printer for the print job.
- postProcessingCost: Estimated post-processing costs.
- profitMargin: Desired profit margin for the print job.
- currency: The currency to use for the cost estimates. Defaults to USD.

Ensure that the estimates are realistic and consider the context provided in the description.

Output the estimates in JSON format.`,
});

const generateEstimatesFromPromptFlow = ai.defineFlow(
  {
    name: 'generateEstimatesFromPromptFlow',
    inputSchema: EstimatesInputSchema,
    outputSchema: EstimatesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
