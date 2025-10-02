
'use server';

import { z } from 'zod';
import { initializeAdminApp } from '@/firebase/server-init';
import { ReportCategory, ReportStatus } from './types';

const reportSchema = z.object({
  description: z.string().min(10, {
    message: 'Description must be at least 10 characters.',
  }),
  category: z.nativeEnum(ReportCategory, {
    required_error: 'Please select a category.',
  }),
  complainantName: z.string().min(1, { message: 'Name is required.' }),
  complainantPhone: z.string().min(1, { message: 'Phone number is required.' }),
  locationAddress: z.string().min(1, { message: 'Address is required.' }),
  photo: z.string().optional(),
  citizenId: z.string().min(1, { message: 'Citizen ID is missing.' }),
});

export type ReportFormValues = z.infer<typeof reportSchema>;

export type FormState = {
  message: string;
  status: 'success' | 'error' | 'idle';
};

export async function submitReport(
  values: ReportFormValues
): Promise<FormState> {
  const validatedFields = reportSchema.safeParse(values);

  if (!validatedFields.success) {
    const firstError = Object.values(validatedFields.error.flatten().fieldErrors)[0]?.[0];
    return {
      status: 'error',
      message: firstError || 'Invalid data provided.',
    };
  }

  const { photo, description, citizenId, complainantName, complainantPhone, locationAddress, category } = validatedFields.data;
  const { firestore } = await initializeAdminApp();

  try {
    const reportData = {
      citizenId,
      complainantName,
      complainantPhone,
      locationAddress,
      description,
      imageUrl: photo || '',
      category,
      reportDate: new Date().toISOString(),
      status: ReportStatus.Pending,
      upvotes: 0,
      citizenIdsWhoUpvoted: [],
      urgency: 'Medium', // Default urgency, admin can change
    };

    const reportsCollection = firestore.collection('issueReports');
    await reportsCollection.add(reportData);

    return {
      status: 'success',
      message: 'Your report has been submitted successfully. Thank you for your contribution!',
    };
  } catch (error) {
    console.error('Error submitting report:', error);
    if (error instanceof Error) {
       return { status: 'error', message: error.message };
    }
    return {
      status: 'error',
      message: 'An unknown error occurred while submitting your report. Please try again.',
    };
  }
}
