
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

async function updateUserStatsAndLeaderboard(firestore: FirebaseFirestore.Firestore, citizenId: string) {
    const userRef = firestore.collection('users').doc(citizenId);
    
    await firestore.runTransaction(async (transaction) => {
      transaction.update(userRef, {
        totalReports: FieldValue.increment(1)
      });
    });

    // In a real-world app, this might be a scheduled function,
    // but for now, we'll update it on every new report.
    await updateLeaderboard(firestore);
}

async function updateLeaderboard(firestore: FirebaseFirestore.Firestore) {
    const usersSnapshot = await firestore.collection('users').where('role', '==', 'citizen').get();
    const users = usersSnapshot.docs.map(doc => doc.data() as UserProfile);

    const leaderboardData = users.map(user => {
        const score = (user.resolvedReports || 0) * 5 + (user.totalReports || 0);
        return {
            uid: user.uid,
            name: user.name,
            score,
            totalReports: user.totalReports || 0,
            resolvedReports: user.resolvedReports || 0,
        };
    }).sort((a, b) => b.score - a.score).slice(0, 20);

    const leaderboardRef = firestore.collection('leaderboard').doc('top_contributors');
    await leaderboardRef.set({
        users: leaderboardData,
        lastUpdated: new Date().toISOString(),
    });
}


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
      urgency: 'Medium',
    };
    
    await firestore.collection('issueReports').add(reportData);
    
    // This is now a separate, non-blocking call to update stats and leaderboard
    updateUserStatsAndLeaderboard(firestore, citizenId).catch(console.error);

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
