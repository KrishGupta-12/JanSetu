
'use client';

import { useMemo, useEffect } from 'react';
import { UserRole, Report, ReportCategory } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useCollection, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

function BudgetStatsSkeleton() {
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-6 w-32" /></TableCell>
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

export default function BudgetStatsPage() {
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

  const budgetStats = useMemo(() => {
    if (!reports) return [];

    const stats: Record<string, number> = {};

    Object.values(ReportCategory).forEach(cat => {
        if(cat !== ReportCategory.Other) {
            stats[cat] = 0;
        }
    });

    reports.forEach(report => {
        if (report.resolution && report.resolution.cost > 0 && report.category && stats[report.category] !== undefined) {
            stats[report.category] += report.resolution.cost;
        }
    });

    return Object.entries(stats).map(([department, totalCost]) => ({
        department: department as ReportCategory,
        totalCost,
    }));

  }, [reports]);

  const isLoading = isUserLoading || areReportsLoading;

  if (isLoading || !adminUser) {
    return <BudgetStatsSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Department Budget Spending</h1>
        <p className="text-muted-foreground">Total costs incurred by each department for resolving issues.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Total Spending by Department</CardTitle>
          <CardDescription>This data is based on the 'cost' field from all resolved reports.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Department</TableHead>
                    <TableHead className="text-right">Total Spent (Rs.)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={2}><Skeleton className="h-8 w-full" /></TableCell>
                      </TableRow>
                    ))
                  ) : budgetStats.length > 0 ? (
                    budgetStats.map((stat) => (
                      <TableRow key={stat.department}>
                        <TableCell className="font-medium">{stat.department}</TableCell>
                        <TableCell className="text-right font-bold">Rs. {stat.totalCost.toLocaleString()}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground h-24">
                        No budget data available. Costs are recorded when a report is resolved.
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
