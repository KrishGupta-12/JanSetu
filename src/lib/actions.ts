'use server';

import { z } from 'zod';
import { moderateImage } from '@/ai/flows/image-moderation';
import { summarizeReports } from '@/ai/flows/summarize-reports';
import { classifyReport } from '@/ai/flows/classify-report';
import { ReportCategory } from './types';
import { initializeAdminApp } from '@/firebase/server-init';
import { collection, addDoc, query, getDocs } from 'firebase/firestore';
import { Report } from './types';

const reportSchema = z.object({
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

  const { photo, description, citizenId, latitude, longitude } = validatedFields.data;
  const { firestore } = await initializeAdminApp();

  try {
    let moderatedPhotoDataUri: string | undefined = undefined;
    if (photo && photo.startsWith('data:image')) {
      const moderationResult = await moderateImage({ photoDataUri: photo });
      moderatedPhotoDataUri = moderationResult.moderatedPhotoDataUri;
    }
    
    // AI Classification
    const classificationResult = await classifyReport({ description });

    const reportData = {
      citizenId,
      description,
      imageUrl: moderatedPhotoDataUri || '',
      category: classificationResult.category,
      urgency: classificationResult.urgency,
      reportDate: new Date().toISOString(),
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
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
    return {
      status: 'error',
      message: 'There was an error submitting your report. Please try again.',
    };
  }
}

export async function summarizeAllReports(): Promise<{ summary: string } | { error: string }> {
  try {
    const { firestore } = await initializeAdminApp();
    const reportsCollection = collection(firestore, 'issueReports');
    const q = query(reportsCollection);
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return { summary: "No reports to summarize at the moment." };
    }

    const reportsForSummary = querySnapshot.docs.map(doc => {
      const data = doc.data() as Report;
      return {
        category: data.category,
        description: data.description,
        location: `${data.latitude}, ${data.longitude}`,
      };
    });
    
    const result = await summarizeReports({ reports: reportsForSummary });
    
    return { summary: result.summary };

  } catch (error) {
    console.error('Error generating summary:', error);
    return { error: 'Failed to generate report summary.' };
  }
}
