'use client';
import ReportTable from '@/components/admin/ReportTable';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Report, ReportStatus, AdminRole } from '@/lib/types';
import { mockReports, mockAdmins } from '@/lib/data';

export default function AdminReportsPage() {
  const { user, isLoading: isUserLoading } = useAuth();
  const router = useRouter();

  const adminData = useMemo(() => {
    if (!user) return null;
    return mockAdmins.find(admin => admin.email === user.email);
  }, [user]);

   useEffect(() => {
    if (!isUserLoading && (!user || !adminData || adminData.role !== AdminRole.SuperAdmin)) {
      router.push('/admin'); 
    }
  }, [user, adminData, isUserLoading, router]);

  const reports = useMemo(() => {
    if (!adminData) return [];
    if (adminData.role === AdminRole.SuperAdmin) {
      return mockReports;
    }
    return [];
  }, [adminData]);
  
  const isLoading = isUserLoading;

  if (isLoading || !user || !adminData) {
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
      <ReportTable reports={reports.sort((a,b) => b.upvotes - a.upvotes) || []} admin={adminData} />
    </div>
  );
}
