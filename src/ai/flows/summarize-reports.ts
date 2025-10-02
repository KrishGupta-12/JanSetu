'use server';

/**
 * @fileOverview A flow to summarize reports for administrators.
 *
 * - summarizeReports - A function that summarizes reports.
 * - SummarizeReportsInput - The input type for the summarizeReports function.
 * - SummarizeReportsOutput - The return type for the summarizeReports function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeReportsInputSchema = z.object({
  reports: z.array(
    z.object({
      category: z.string().describe('The category of the report.'),
      description: z.string().describe('The description of the report.'),
      location: z.string().describe('The location of the report.'),
      photoDataUri: z.string().optional().describe(
        "A photo associated with the report, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
      ),
    })
  ).describe('An array of report objects to summarize.'),
});
export type SummarizeReportsInput = z.infer<typeof SummarizeReportsInputSchema>;

const SummarizeReportsOutputSchema = z.object({
  summary: z.string().describe('A summary of the reports, highlighting key issues and urgent matters.'),
});
export type SummarizeReportsOutput = z.infer<typeof SummarizeReportsOutputSchema>;

export async function summarizeReports(input: SummarizeReportsInput): Promise<SummarizeReportsOutput> {
  return summarizeReportsFlow(input);
}

const summarizeReportsPrompt = ai.definePrompt({
  name: 'summarizeReportsPrompt',
  input: {schema: SummarizeReportsInputSchema},
  output: {schema: SummarizeReportsOutputSchema},
  prompt: `You are an administrative assistant tasked with summarizing citizen reports to identify key issues and urgent matters.\n\nReports:\n{{#each reports}}\nCategory: {{category}}\nDescription: {{description}}\nLocation: {{location}}\n{{#if photoDataUri}}\nPhoto: {{media url=photoDataUri}}\n{{/if}}\n---\n{{/each}}\n\nProvide a concise summary of the reports, highlighting any recurring themes, urgent issues, or areas of concern that require immediate attention.`,
});

const summarizeReportsFlow = ai.defineFlow(
  {
    name: 'summarizeReportsFlow',
    inputSchema: SummarizeReportsInputSchema,
    outputSchema: SummarizeReportsOutputSchema,
  },
  async input => {
    const {output} = await summarizeReportsPrompt(input);
    return output!;
  }
);
