'use server';
/**
 * @fileOverview This file contains a Genkit flow for moderating images by blurring faces.
 *
 * - moderateImage -  A function that takes an image data URI and blurs any detected faces.
 * - ModerateImageInput - The input type for the moderateImage function.
 * - ModerateImageOutput - The return type for the moderateImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ModerateImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      'A photo to moderate, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' // Corrected typo here
    ),
});
export type ModerateImageInput = z.infer<typeof ModerateImageInputSchema>;

const ModerateImageOutputSchema = z.object({
  moderatedPhotoDataUri: z
    .string()
    .describe('The moderated photo with faces blurred, as a data URI.'),
});
export type ModerateImageOutput = z.infer<typeof ModerateImageOutputSchema>;

export async function moderateImage(input: ModerateImageInput): Promise<ModerateImageOutput> {
  return moderateImageFilterFlow(input);
}

const moderateImageFilterPrompt = ai.definePrompt({
  name: 'moderateImageFilterPrompt',
  input: {schema: ModerateImageInputSchema},
  output: {schema: ModerateImageOutputSchema},
  prompt: `Please blur any faces present in the following image to protect privacy.

   {{media url=photoDataUri}}
  `,
});

const moderateImageFilterFlow = ai.defineFlow(
  {
    name: 'moderateImageFilterFlow',
    inputSchema: ModerateImageInputSchema,
    outputSchema: ModerateImageOutputSchema,
  },
  async input => {
    const {output} = await moderateImageFilterPrompt(input);
    return output!;
  }
);
