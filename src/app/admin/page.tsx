'use client';
import ReportTable from '@/components/admin/ReportTable';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { doc } from 'firebase/firestore';
import { useCollection } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Report } from '@/lib/types';

export default function AdminDashboardPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();

  const adminRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'admins', user.uid);
  }, [firestore, user]);

  const { data: adminData, isLoading: isAdminLoading } = useDoc(adminRef);

  const reportsQuery = useMemoFirebase(() => {
      if (!firestore) return null;
      return collection(firestore, 'issue_reports');
  }, [firestore]);

  const { data: reports, isLoading: areReportsLoading } = useCollection<Report>(reportsQuery);

  useEffect(() => {
    if (!isUserLoading && !isAdminLoading && (!user || !adminData)) {
      router.push('/dashboard'); // Redirect non-admins to user dashboard
    }
  }, [user, adminData, isUserLoading, isAdminLoading, router]);

  const isLoading = isUserLoading || isAdminLoading || areReportsLoading;

  if (isLoading || !user || !adminData) {
     return (
       <div className="space-y-6">
         <Skeleton className="h-10 w-1/2" />
         <Skeleton className="h-8 w-1/3" />
         <Skeleton className="h-96 w-full" />
       </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-headline font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage and track all citizen reports.</p>
      </div>
      <ReportTable reports={reports || []} />
    </div>
  );
}
