
'use server';

import { z } from 'zod';
import { moderateImage } from '@/ai/flows/image-moderation';
import { classifyReport } from '@/ai/flows/classify-report';
import { initializeAdminApp } from '@/firebase/server-init';
import { collection, addDoc } from 'firebase/firestore';

const reportSchema = z.object({
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  complainantName: z.string().min(1, 'Name is required.'),
  complainantPhone: z.string().min(1, 'Phone number is required.'),
  locationAddress: z.string().min(1, 'Address is required.'),
  photo: z.string().optional(),
  citizenId: z.string().min(1, 'Citizen ID is missing.'),
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

  const { photo, description, citizenId, complainantName, complainantPhone, locationAddress } = validatedFields.data;
  const { firestore } = await initializeAdminApp();

  try {
    let finalImageUrl = '';
    if (photo && photo.startsWith('data:image')) {
      const moderationResult = await moderateImage({ photoDataUri: photo });
      finalImageUrl = moderationResult.moderatedPhotoDataUri;
    }
    
    // AI Classification
    const classificationResult = await classifyReport({ description });

    const reportData = {
      citizenId,
      complainantName,
      complainantPhone,
      locationAddress,
      description,
      imageUrl: finalImageUrl,
      category: classificationResult.category,
      urgency: classificationResult.urgency,
      reportDate: new Date().toISOString(),
      status: 'Pending',
      upvotes: 0,
      citizenIdsWhoUpvoted: [],
    };

    const reportsCollection = collection(firestore, 'issueReports');
    await addDoc(reportsCollection, reportData);

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
