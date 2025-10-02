'use server';

import { z } from 'zod';
import { moderateImage } from '@/ai/flows/image-moderation';
import { summarizeReports } from '@/ai/flows/summarize-reports';
import { ReportCategory } from './types';
import { mockReports } from './data';

const reportSchema = z.object({
  category: z.nativeEnum(ReportCategory),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  latitude: z.string(),
  longitude: z.string(),
  photo: z.string().optional(),
  citizenId: z.string().min(1, 'Citizen ID is missing.'),
});

export type FormState = {
  message: string;
  status: 'success' | 'error' | 'idle';
};

export async function submitReport(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = reportSchema.safeParse({
    category: formData.get('category'),
    description: formData.get('description'),
    latitude: formData.get('latitude'),
    longitude: formData.get('longitude'),
    photo: formData.get('photo'),
    citizenId: formData.get('citizenId'),
  });

  if (!validatedFields.success) {
    const firstError = Object.values(validatedFields.error.flatten().fieldErrors)[0]?.[0];
    return {
      status: 'error',
      message: firstError || 'Invalid data provided.',
    };
  }

  const { photo } = validatedFields.data;

  try {
    if (photo && photo.startsWith('data:image')) {
      // In a real app, we would use the moderated image.
      // For now, we just call the flow to show it's connected.
      await moderateImage({ photoDataUri: photo });
    }

    // In a real app, this is where you'd save the report to the database.
    // We'll just log it to the console and return success.
    console.log('Mock Report Submitted:', validatedFields.data);

    // Simulate a delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      status: 'success',
      message: 'Your report has been submitted successfully. Thank you for your contribution!',
    };
  } catch (error) {
    console.error('Error submitting report:', error);
    return {
      status: 'error',
      message: 'There was an error submitting your report. Please try again.',
    };
  }
}

export async function summarizeAllReports(): Promise<{ summary: string } | { error: string }> {
  try {
    if (mockReports.length === 0) {
      return { summary: "No reports to summarize at the moment." };
    }

    const reportsForSummary = mockReports.map(doc => ({
        category: doc.category,
        description: doc.description,
        location: `${doc.latitude}, ${doc.longitude}`,
    }));
    
    // The Genkit flow can still be called with mock data.
    const result = await summarizeReports({ reports: reportsForSummary });
    
    return { summary: result.summary };

  } catch (error) {
    console.error('Error generating summary:', error);
    return { error: 'Failed to generate report summary.' };
  }
}
