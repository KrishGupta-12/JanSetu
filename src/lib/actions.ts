'use server';

import { z } from 'zod';
import { moderateImage } from '@/ai/flows/image-moderation';
import { summarizeReports } from '@/ai/flows/summarize-reports';
import { ReportCategory, ReportStatus } from './types';
import { getFirestore, collection, getDocs, serverTimestamp, addDoc, doc, setDoc } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import { getAuth } from 'firebase/auth';

const reportSchema = z.object({
  category: z.nativeEnum(ReportCategory),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  latitude: z.string(),
  longitude: z.string(),
  photo: z.string().optional(),
  citizenId: z.string(),
});

export type FormState = {
  message: string;
  status: 'success' | 'error' | 'idle';
};

export async function submitReport(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const { firestore, auth } = initializeFirebase();
  const currentUser = auth.currentUser;
  
  if (!currentUser) {
     return {
      status: 'error',
      message: 'You must be logged in to submit a report.',
    };
  }

  const validatedFields = reportSchema.safeParse({
    category: formData.get('category'),
    description: formData.get('description'),
    latitude: formData.get('latitude'),
    longitude: formData.get('longitude'),
    photo: formData.get('photo'),
    citizenId: currentUser.uid,
  });

  if (!validatedFields.success) {
    const firstError = Object.values(validatedFields.error.flatten().fieldErrors)[0]?.[0];
    return {
      status: 'error',
      message: firstError || 'Invalid data provided.',
    };
  }

  const { category, description, latitude, longitude, photo, citizenId } = validatedFields.data;

  try {
    let moderatedPhotoUri: string | undefined = undefined;

    if (photo && photo.startsWith('data:image')) {
      const moderationResult = await moderateImage({ photoDataUri: photo });
      moderatedPhotoUri = moderationResult.moderatedPhotoDataUri;
    }

    const reportData = {
        citizenId,
        category,
        description,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        imageUrl: moderatedPhotoUri || '',
        reportDate: new Date().toISOString(),
        status: ReportStatus.Pending,
        updatedAt: serverTimestamp()
    };
    
    const issueReportsCollection = collection(firestore, 'issue_reports');
    const newReportRef = await addDoc(issueReportsCollection, { ...reportData });

    // Update the document with its own ID
    await setDoc(doc(firestore, 'issue_reports', newReportRef.id), { id: newReportRef.id }, { merge: true });

    const userIssueReportRef = doc(firestore, `users/${citizenId}/issue_reports`, newReportRef.id);
    await setDoc(userIssueReportRef, { ...reportData, id: newReport_ref.id });


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
   const { firestore } = initializeFirebase();
  try {
    const reportsCollection = collection(firestore, 'issue_reports');
    const reportSnapshot = await getDocs(reportsCollection);

    if (reportSnapshot.empty) {
      return { summary: "No reports to summarize at the moment." };
    }

    const reportsForSummary = reportSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        category: data.category,
        description: data.description,
        location: `${data.latitude}, ${data.longitude}`,
      }
    });
    
    const result = await summarizeReports({ reports: reportsForSummary });
    
    return { summary: result.summary };

  } catch (error) {
    console.error('Error generating summary:', error);
    return { error: 'Failed to generate report summary.' };
  }
}
