'use client';
import ReportTable from '@/components/admin/ReportTable';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { doc } from 'firebase/firestore';
import { useCollection } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Report, ReportStatus } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ListChecks, Hourglass, Loader, FileText } from 'lucide-react';

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
  
  const reportStats = useMemo(() => {
    if (!reports) {
      return { total: 0, pending: 0, inProgress: 0, resolved: 0 };
    }
    return {
      total: reports.length,
      pending: reports.filter(r => r.status === ReportStatus.Pending).length,
      inProgress: reports.filter(r => r.status === ReportStatus.InProgress).length,
      resolved: reports.filter(r => r.status === ReportStatus.Resolved).length,
    };
  }, [reports]);


  const isLoading = isUserLoading || isAdminLoading || areReportsLoading;

  if (isLoading || !user || !adminData) {
     return (
       <div className="space-y-6">
         <Skeleton className="h-10 w-1/2" />
         <Skeleton className="h-8 w-1/3" />
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
        <h1 className="text-3xl font-headline font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage and track all citizen reports.</p>
      </div>

       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportStats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Hourglass className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportStats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Loader className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportStats.inProgress}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <ListChecks className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportStats.resolved}</div>
          </CardContent>
        </Card>
      </div>

      <ReportTable reports={reports || []} />
    </div>
  );
}
