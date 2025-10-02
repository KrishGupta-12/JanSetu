'use server';
/**
 * @fileOverview A Genkit flow to classify a report's category and urgency.
 *
 * - classifyReport - A function that analyzes a report description.
 * - ClassifyReportInput - The input type for the classifyReport function.
 * - ClassifyReportOutput - The return type for the classifyReport function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { ReportCategory, ReportUrgency } from '@/lib/types';

const ClassifyReportInputSchema = z.object({
  description: z.string().describe('The user-submitted description of the issue.'),
});
export type ClassifyReportInput = z.infer<typeof ClassifyReportInputSchema>;

const ClassifyReportOutputSchema = z.object({
  category: z.nativeEnum(ReportCategory).describe('The most likely category for this report.'),
  urgency: z.enum(['Low', 'Medium', 'High', 'Critical']).describe('The estimated urgency of this report.'),
});
export type ClassifyReportOutput = z.infer<typeof ClassifyReportOutputSchema>;

export async function classifyReport(input: ClassifyReportInput): Promise<ClassifyReportOutput> {
    return classifyReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'classifyReportPrompt',
  input: { schema: ClassifyReportInputSchema },
  output: { schema: ClassifyReportOutputSchema },
  prompt: `You are an expert dispatcher for a city's civic services. Your task is to analyze a citizen's report and classify it into the correct category and assess its urgency.

Available Categories:
- Waste Management: Garbage overflow, illegal dumping, dead animals.
- Potholes: Potholes, road damage, cave-ins.
- Streetlight Outage: Non-functional or flickering streetlights.
- Water Logging: Flooding, clogged drains, broken water pipes.
- Other: Any other civic issue like broken benches, stray animals, etc.

Urgency Levels:
- Critical: Immediate danger to life or property (e.g., road cave-in, major pipeline burst, exposed live wires).
- High: Significant disruption or safety hazard that needs quick attention (e.g., large pothole on a major road, severe water logging).
- Medium: A standard issue that should be addressed in a timely manner (e.g., overflowing garbage bin, non-critical streetlight outage).
- Low: A minor issue or inconvenience (e.g., broken park bench, request for new installation).

Analyze the following report description and determine the most appropriate category and urgency.

Report Description: {{{description}}}
`,
});

const classifyReportFlow = ai.defineFlow(
  {
    name: 'classifyReportFlow',
    inputSchema: ClassifyReportInputSchema,
    outputSchema: ClassifyReportOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
