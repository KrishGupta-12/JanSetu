'use server';

import { z } from 'zod';
import { moderateImage } from '@/ai/flows/image-moderation';
import { summarizeReports } from '@/ai/flows/summarize-reports';
import { classifyReport } from '@/ai/flows/classify-report';
import { ReportCategory } from './types';
import { initializeFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp, getDocs, query } from 'firebase/firestore';
import { Report } from './types';

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

  const { photo, description, citizenId, latitude, longitude } = validatedFields.data;
  const { firestore } = initializeFirebase();

  try {
    let moderatedPhotoDataUri: string | undefined = undefined;
    if (photo && photo.startsWith('data:image')) {
      const moderationResult = await moderateImage({ photoDataUri: photo });
      moderatedPhotoDataUri = moderationResult.moderatedPhotoDataUri;
    }
    
    // AI Classification
    const classificationResult = await classifyReport({ description });

    const reportData = {
        ...validatedFields.data,
        imageUrl: moderatedPhotoDataUri || validatedFields.data.photo || '',
        category: classificationResult.category,
        urgency: classificationResult.urgency,
        reportDate: serverTimestamp(),
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        status: 'Pending',
        upvotes: 0,
        citizenIdsWhoUpvoted: [],
    };

    // In a real app, this is where you'd save the report to the database.
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
    const { firestore } = initializeFirebase();
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
