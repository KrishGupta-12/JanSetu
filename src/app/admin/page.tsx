'use client';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Report, ReportStatus, AdminRole } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ListChecks, Hourglass, Loader, FileText, Siren } from 'lucide-react';
import ReportTable from '@/components/admin/ReportTable';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import MapProvider from '@/components/home/MapProvider';
import MapView from '@/components/home/MapView';

export default function AdminDashboardPage() {
  const { user: adminData, isLoading: isUserLoading } = useAuth();
  const router = useRouter();
  const firestore = useFirestore();
  
  useEffect(() => {
    if (!isUserLoading && (!adminData || !adminData.role)) {
      router.push('/dashboard'); 
    }
  }, [adminData, isUserLoading, router]);

  const reportsQuery = useMemoFirebase(() => {
    if (!adminData) return null;
    if (adminData.role === AdminRole.SuperAdmin) {
      return query(collection(firestore, 'issueReports'));
    } else {
      return query(collection(firestore, 'issueReports'), where('assignedAdminId', '==', adminData.uid));
    }
  }, [adminData, firestore]);

  const { data: reports, isLoading: areReportsLoading } = useCollection<Report>(reportsQuery);

  const reportStats = useMemo(() => {
    if (!reports) {
      return { total: 0, pending: 0, inProgress: 0, resolved: 0, critical: 0 };
    }
    return {
      total: reports.length,
      pending: reports.filter(r => r.status === ReportStatus.Pending).length,
      inProgress: reports.filter(r => r.status === ReportStatus.InProgress).length,
      resolved: reports.filter(r => r.status === ReportStatus.Resolved).length,
      critical: reports.filter(r => r.urgency === 'Critical').length,
    };
  }, [reports]);

  const isLoading = isUserLoading || areReportsLoading;

  if (isLoading || !adminData) {
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
  
  // Department Admin Dashboard
  if(adminData.role === AdminRole.DepartmentAdmin) {
    return (
       <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-headline font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            {`Manage reports for the ${adminData.department} department.`}
          </p>
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

        <ReportTable reports={reports || []} admin={adminData} />
      </div>
    );
  }

  // Super Admin Dashboard
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-headline font-bold tracking-tight">Super Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Oversee all platform activity and manage critical issues.
        </p>
      </div>

       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportStats.total}</div>
            <p className="text-xs text-muted-foreground">across all departments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Assignment</CardTitle>
            <Hourglass className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportStats.pending}</div>
             <p className="text-xs text-muted-foreground">waiting for department assignment</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
            <Siren className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{reportStats.critical}</div>
            <p className="text-xs text-muted-foreground">require immediate attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved Reports</CardTitle>
            <ListChecks className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportStats.resolved}</div>
            <p className="text-xs text-muted-foreground">across all departments</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>
                Recent Reports
              </CardTitle>
                <Button asChild variant="secondary" size="sm">
                    <Link href="/admin/reports">View All Reports</Link>
                </Button>
            </CardHeader>
            <CardContent>
              <ReportTable reports={reports?.slice(0, 5) || []} admin={adminData} />
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Live Issues Map</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              <MapProvider>
                <MapView reports={reports || []} />
              </MapProvider>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
