'use client';
import ReportTable from '@/components/admin/ReportTable';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Report, ReportStatus, AdminRole } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ListChecks, Hourglass, Loader, FileText } from 'lucide-react';
import { mockReports, mockAdmins } from '@/lib/data';

export default function AdminDashboardPage() {
  const { user, isLoading: isUserLoading } = useAuth();
  const router = useRouter();

  const adminData = useMemo(() => {
    if (!user) return null;
    return mockAdmins.find(admin => admin.email === user.email);
  }, [user]);

  const reports = useMemo(() => {
    if (!adminData) return [];
    if (adminData.role === AdminRole.SuperAdmin) {
      return mockReports;
    } else {
      return mockReports.filter(report => report.assignedAdminId === adminData.id);
    }
  }, [adminData]);
  

  useEffect(() => {
    if (!isUserLoading && (!user || !adminData)) {
      router.push('/dashboard'); 
    }
  }, [user, adminData, isUserLoading, router]);
  
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


  const isLoading = isUserLoading;

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
        <p className="text-muted-foreground">
          {adminData.role === AdminRole.SuperAdmin 
            ? "Manage all citizen reports and assign them to departments." 
            : `Manage reports for the ${adminData.department} department.`
          }
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
