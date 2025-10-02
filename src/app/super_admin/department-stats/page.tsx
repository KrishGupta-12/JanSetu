
'use client';

import { useState, useMemo, useEffect } from 'react';
import { UserProfile, UserRole, Report, ReportCategory, ReportStatus, DepartmentAdminRoles } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

function DepartmentStatsSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-4 w-2/3" />
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead><Skeleton className="h-6 w-full" /></TableHead>
                  <TableHead><Skeleton className="h-6 w-full" /></TableHead>
                  <TableHead><Skeleton className="h-6 w-full" /></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface DepartmentStat {
    department: ReportCategory;
    totalAssigned: number;
    totalResolved: number;
}

export default function DepartmentStatsPage() {
  const { user: adminUser, isLoading: isUserLoading, firestore } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!isUserLoading && (!adminUser || adminUser.role !== UserRole.SuperAdmin)) {
      toast({ variant: 'destructive', title: 'Access Denied' });
      router.push('/admin');
    }
  }, [isUserLoading, adminUser, router, toast]);

  const reportsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'issueReports'));
  }, [firestore]);
  
  const { data: reports, isLoading: areReportsLoading } = useCollection<Report>(reportsQuery);

  const departmentStats = useMemo(() => {
    if (!reports) return [];

    const stats: Record<string, { totalAssigned: number; totalResolved: number }> = {};

    Object.values(ReportCategory).forEach(cat => {
        if(cat !== ReportCategory.Other) {
            stats[cat] = { totalAssigned: 0, totalResolved: 0 };
        }
    });

    reports.forEach(report => {
        if (report.assignedAdminId && report.category && stats[report.category]) {
            stats[report.category].totalAssigned++;
            if (report.status === ReportStatus.Resolved) {
                stats[report.category].totalResolved++;
            }
        }
    });

    return Object.entries(stats).map(([department, data]) => ({
        department: department as ReportCategory,
        ...data,
    }));

  }, [reports]);

  const isLoading = isUserLoading || areReportsLoading;

  if (isLoading || !adminUser) {
    return <DepartmentStatsSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Department Statistics</h1>
        <p className="text-muted-foreground">A breakdown of report assignments and resolutions by department.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Department Performance</CardTitle>
          <CardDescription>Overview of how many reports are assigned to and resolved by each department.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Department</TableHead>
                    <TableHead>Total Assigned Reports</TableHead>
                    <TableHead>Total Resolved Reports</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={3}><Skeleton className="h-8 w-full" /></TableCell>
                      </TableRow>
                    ))
                  ) : departmentStats.length > 0 ? (
                    departmentStats.map((stat) => (
                      <TableRow key={stat.department}>
                        <TableCell className="font-medium">{stat.department}</TableCell>
                        <TableCell>{stat.totalAssigned}</TableCell>
                        <TableCell>{stat.totalResolved}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground h-24">
                        No department data available.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
