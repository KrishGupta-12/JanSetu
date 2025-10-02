'use client';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Report, ReportStatus, AdminRole, UserProfile } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ListChecks, Hourglass, Loader, FileText, Star } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { differenceInDays } from 'date-fns';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';

const statusColors: {[key in ReportStatus]: string} = {
    [ReportStatus.Pending]: 'hsl(var(--chart-1))',
    [ReportStatus.InProgress]: 'hsl(var(--chart-2))',
    [ReportStatus.Resolved]: 'hsl(var(--chart-3))',
    [ReportStatus.Rejected]: 'hsl(var(--chart-4))',
    [ReportStatus.PendingCitizenFeedback]: 'hsl(var(--chart-5))',
    [ReportStatus.PendingApproval]: 'hsl(var(--chart-1))'
}


export default function MyDepartmentPage() {
  const { user: adminData, isLoading: isUserLoading } = useAuth();
  const router = useRouter();
  const firestore = useFirestore();

  const reportsQuery = useMemoFirebase(() => {
    if (!adminData || !adminData.uid) return null;
     if (adminData.role === AdminRole.SuperAdmin) return null;
    return query(collection(firestore, 'issueReports'), where('assignedAdminId', '==', adminData.uid));
  }, [adminData, firestore]);

  const { data: reports, isLoading: reportsLoading } = useCollection<Report>(reportsQuery);

  useEffect(() => {
    if (!isUserLoading && (!adminData || !adminData.role || adminData.role === AdminRole.SuperAdmin)) {
      router.push('/admin'); 
    }
  }, [adminData, isUserLoading, router]);

  const departmentStats = useMemo(() => {
    if (!reports) {
       return {
            total: 0, pending: 0, inProgress: 0, resolved: 0,
            avgResolutionTime: 0, avgCitizenRating: 0, totalCost: 0
        };
    }
    const resolvedReports = reports.filter(r => r.status === ReportStatus.Resolved && r.resolution);
    if (reports.length === 0) {
        return {
            total: 0, pending: 0, inProgress: 0, resolved: 0,
            avgResolutionTime: 0, avgCitizenRating: 0, totalCost: 0
        };
    }

    const totalResolutionTime = resolvedReports.reduce((acc, r) => {
        return acc + differenceInDays(new Date(r.resolution!.date), new Date(r.reportDate));
    }, 0);

    const totalCitizenRating = resolvedReports.reduce((acc, r) => acc + (r.resolution!.citizenRating || 0), 0);
    const ratedReportsCount = resolvedReports.filter(r => r.resolution!.citizenRating).length;
    const totalCost = reports.reduce((acc, r) => acc + (r.resolution?.cost || 0), 0);
    
    return {
      total: reports.length,
      pending: reports.filter(r => r.status === ReportStatus.Pending).length,
      inProgress: reports.filter(r => r.status === ReportStatus.InProgress).length,
      resolved: resolvedReports.length,
      avgResolutionTime: resolvedReports.length > 0 ? (totalResolutionTime / resolvedReports.length).toFixed(1) : 0,
      avgCitizenRating: ratedReportsCount > 0 ? (totalCitizenRating / ratedReportsCount).toFixed(1) : 0,
      totalCost,
    };
  }, [reports]);

  const reportsByStatus = useMemo(() => {
        if (!reports) return [];
        const counts = Object.values(ReportStatus).reduce((acc, status) => {
            acc[status] = 0;
            return acc;
        }, {} as Record<ReportStatus, number>);

        reports.forEach(report => {
            counts[report.status]++;
        });

        return Object.entries(counts).map(([name, value]) => ({ name, value }));

    }, [reports]);


  const isLoading = isUserLoading || reportsLoading;

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-headline font-bold tracking-tight">{adminData.department} Department</h1>
        <p className="text-muted-foreground">
          Analytics and performance overview for your department.
        </p>
      </div>

       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assigned Reports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{departmentStats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Resolution Time</CardTitle>
            <Hourglass className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{departmentStats.avgResolutionTime} <span className="text-base font-normal">days</span></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Citizen Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{departmentStats.avgCitizenRating} <span className="text-base font-normal">/ 5</span></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spending</CardTitle>
            <p className="text-2xl font-bold">Rs.</p>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rs.{departmentStats.totalCost.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
            <CardTitle>Reports Status Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie data={reportsByStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                        {reportsByStatus.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={statusColors[entry.name as ReportStatus]} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </CardContent>
    </Card>

    </div>
  );
}
