'use server';
/**
 * @fileOverview A Genkit flow to get the Air Quality Index (AQI) for a city.
 *
 * - getAqi - A function that returns the AQI for a given city.
 * - GetAqiInput - The input type for the getAqi function.
 * - GetAqiOutput - The return type for the getAqi function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GetAqiInputSchema = z.object({
  city: z.string().describe('The city for which to get the AQI.'),
});
export type GetAqiInput = z.infer<typeof GetAqiInputSchema>;

const GetAqiOutputSchema = z.object({
  aqi: z.number().describe('The Air Quality Index value.'),
  level: z.string().describe('The descriptive level of the AQI (e.g., Good, Moderate).'),
});
export type GetAqiOutput = z.infer<typeof GetAqiOutputSchema>;

export async function getAqi(input: GetAqiInput): Promise<GetAqiOutput> {
  return getAqiFlow(input);
}

const getAqiFlow = ai.defineFlow(
  {
    name: 'getAqiFlow',
    inputSchema: GetAqiInputSchema,
    outputSchema: GetAqiOutputSchema,
  },
  async (input) => {
    // In a real application, you would call an external API here.
    // For this demo, we'll generate a random AQI value.
    const simulatedAqi = Math.floor(Math.random() * (250 - 30 + 1)) + 30;

    let level = 'Good';
    if (simulatedAqi > 50) level = 'Moderate';
    if (simulatedAqi > 100) level = 'Unhealthy for Sensitive Groups';
    if (simulatedAqi > 150) level = 'Unhealthy';
    if (simulatedAqi > 200) level = 'Very Unhealthy';
    if (simulatedAqi > 300) level = 'Hazardous';
    
    return {
      aqi: simulatedAqi,
      level,
    };
  }
);
