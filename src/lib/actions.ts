'use server';

import { z } from 'zod';
import { moderateImage } from '@/ai/flows/image-moderation';
import { summarizeReports } from '@/ai/flows/summarize-reports';
import { mockReports } from './data';
import type { Report } from './types';
import { ReportCategory } from './types';

const reportSchema = z.object({
  category: z.nativeEnum(ReportCategory),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  latitude: z.string(),
  longitude: z.string(),
  photo: z.string().optional(),
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
  });

  if (!validatedFields.success) {
    return {
      status: 'error',
      message: validatedFields.error.flatten().fieldErrors.description?.[0] || 'Invalid data provided.',
    };
  }

  const { category, description, latitude, longitude, photo } = validatedFields.data;

  try {
    let moderatedPhotoUri: string | undefined = undefined;

    if (photo && photo.startsWith('data:image')) {
      console.log('Moderating image...');
      const moderationResult = await moderateImage({ photoDataUri: photo });
      moderatedPhotoUri = moderationResult.moderatedPhotoDataUri;
      console.log('Image moderation successful.');
    }

    // In a real app, you would save the report to a database here
    // along with the moderatedPhotoUri if it exists.
    console.log('New Report Submitted:', {
      category,
      description,
      location: { lat: parseFloat(latitude), lng: parseFloat(longitude) },
      photoUrl: moderatedPhotoUri || photo, // Use moderated if available
    });

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
    const reportsForSummary = mockReports.map((report: Report) => ({
      category: report.category,
      description: report.description,
      location: report.address,
    }));
    
    const result = await summarizeReports({ reports: reportsForSummary });
    
    return { summary: result.summary };

  } catch (error) {
    console.error('Error generating summary:', error);
    return { error: 'Failed to generate report summary.' };
  }
}
