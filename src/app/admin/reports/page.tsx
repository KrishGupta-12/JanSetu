
'use client';
import ReportTable from '@/components/admin/ReportTable';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Report, ReportStatus, UserRole } from '@/lib/types';
import { useCollection, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';


export default function AdminReportsPage() {
  const { user: adminData, isLoading: isUserLoading, firestore } = useAuth();
  const router = useRouter();

   useEffect(() => {
    if (!isUserLoading && (!adminData || adminData.role !== UserRole.SuperAdmin)) {
      router.push('/admin'); 
    }
  }, [adminData, isUserLoading, router]);

  const reportsQuery = useMemoFirebase(() => {
    if (!firestore || !adminData || adminData.role !== UserRole.SuperAdmin) return null;
    return query(collection(firestore, 'issueReports'));
  }, [adminData, firestore]);

  const { data: reports, isLoading: areReportsLoading } = useCollection<Report>(reportsQuery);
  
  const isLoading = isUserLoading || areReportsLoading;

  if (isLoading || !adminData) {
     return (
       <div className="space-y-6">
         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
         </div>
         <Skeleton className="h-96 w-full" />
       </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-headline font-bold tracking-tight">All Reports</h1>
        <p className="text-muted-foreground">
            Manage all citizen reports and assign them to departments.
        </p>
      </div>
      <ReportTable reports={reports?.sort((a,b) => b.upvotes - a.upvotes) || []} admin={adminData} />
    </div>
  );
}
