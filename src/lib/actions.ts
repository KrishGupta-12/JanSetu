
'use server';

import { z } from 'zod';
import { initializeAdminApp } from '@/firebase/server-init';
import { ReportCategory, ReportStatus, UserProfile } from './types';
import { FieldValue } from 'firebase-admin/firestore';

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
  
  try {
    const { firestore } = await initializeAdminApp();

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
    
    // Use a transaction to create the report and update the user's report count
    const userRef = firestore.collection('users').doc(citizenId);
    const reportRef = firestore.collection('issueReports').doc();

    await firestore.runTransaction(async (transaction) => {
      // It's good practice to read the user doc first in a transaction,
      // though here we are just incrementing.
      const userDoc = await transaction.get(userRef);
      if (!userDoc.exists) {
        throw new Error("User profile does not exist!");
      }

      transaction.set(reportRef, reportData);
      transaction.update(userRef, {
        totalReports: FieldValue.increment(1)
      });
    });


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
