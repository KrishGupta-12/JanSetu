'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useCollection, useMemoFirebase } from '@/firebase';
import { Report, ReportStatus, UserRole } from '@/lib/types';
import { collection, query } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ReportTable from '@/components/admin/ReportTable';
import { FileText, Hourglass, Siren, ListChecks } from 'lucide-react';

function DashboardSkeleton() {
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

export default function SuperAdminDashboardPage() {
  const { user: adminData, isLoading: isUserLoading, firestore } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && (!adminData || adminData.role !== UserRole.SuperAdmin)) {
      router.push('/login');
    }
  }, [adminData, isUserLoading, router]);

  const reportsQuery = useMemoFirebase(() => {
    if (!firestore || !adminData) return null;
    return query(collection(firestore, 'issueReports'));
  }, [adminData, firestore]);

  const { data: reports, isLoading: areReportsLoading } = useCollection<Report>(reportsQuery);

  const reportStats = useMemo(() => {
    if (!reports) {
      return { total: 0, pending: 0, inProgress: 0, resolved: 0, critical: 0 };
    }
    const pendingReports = reports.filter(r => r.status === ReportStatus.Pending && !r.assignedAdminId);
    return {
      total: reports.length,
      pending: pendingReports.length,
      inProgress: reports.filter(r => r.status === ReportStatus.InProgress).length,
      resolved: reports.filter(r => r.status === ReportStatus.Resolved).length,
      critical: reports.filter(r => r.urgency === 'Critical').length,
    };
  }, [reports]);

  const isLoading = isUserLoading || areReportsLoading;

  if (isLoading || !adminData) {
    return <DashboardSkeleton />;
  }

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

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Reports</CardTitle>
          <Button asChild variant="secondary" size="sm">
            <Link href="/super_admin/reports">View All Reports</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <ReportTable reports={reports?.slice(0, 10) || []} admin={adminData} />
        </CardContent>
      </Card>
    </div>
  );
}
