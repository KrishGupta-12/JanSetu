'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import AqiCard from '@/components/home/AqiCard';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Report } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ReportStatus, AdminRole } from '@/lib/types';
import { Files, Megaphone, Trophy } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, limit } from 'firebase/firestore';


const statusStyles: { [key in ReportStatus]: string } = {
  [ReportStatus.Pending]: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-700',
  [ReportStatus.InProgress]: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-700',
  [ReportStatus.Resolved]: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700',
  [ReportStatus.Rejected]: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700',
  [ReportStatus.PendingCitizenFeedback]: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/50 dark:text-purple-300 dark:border-purple-700',
  [ReportStatus.PendingApproval]: 'bg-pink-100 text-pink-800 border-pink-300 dark:bg-pink-900/50 dark:text-pink-300 dark:border-pink-700',
};


export default function DashboardPage() {
  const { user, isLoading: isUserLoading } = useAuth();
  const router = useRouter();
  const firestore = useFirestore();

  const userReportsQuery = useMemoFirebase(
    () => user && firestore ? query(collection(firestore, 'issueReports'), where('citizenId', '==', user.uid), limit(2)) : null,
    [user, firestore]
  );
  const { data: userReports, isLoading: isReportsLoading } = useCollection<Report>(userReportsQuery);
  
  const allReportsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'issueReports'));
  }, [firestore]);
  const { data: allReports, isLoading: areAllReportsLoading } = useCollection<Report>(allReportsQuery);


  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
     if (!isUserLoading && user && user.role) { // Any role indicates an admin
      router.push('/admin');
    }
  }, [user, isUserLoading, router]);

  const isLoading = isUserLoading || isReportsLoading || areAllReportsLoading;

  if (isLoading || !user || user.role) {
    return (
       <div className="flex-1 w-full p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            <div className="lg:col-span-1 flex flex-col gap-6">
                <Skeleton className="h-[180px] w-full rounded-xl" />
                <Skeleton className="flex-1 w-full rounded-xl" />
            </div>
             <div className="lg:col-span-2 flex flex-col gap-6">
                 <Skeleton className="flex-1 w-full rounded-xl" />
            </div>
        </div>
       </div>
    );
  }

  return (
    <div className="flex-1 w-full relative p-6">
       <div className="space-y-6">
        <div>
            <h1 className="text-3xl font-headline font-bold tracking-tight">Citizen Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {user.name}! Here's what's happening in your city.
            </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AqiCard />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Trophy className="text-yellow-500" /> Leaderboard</CardTitle>
                        <CardDescription>See top community contributors.</CardDescription>
                    </CardHeader>
                    <CardContent>
                    <Button asChild className="w-full">
                        <Link href="/dashboard/leaderboard">View Leaderboard</Link>
                    </Button>
                    </CardContent>
                </Card>
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Megaphone /> Community Feed</CardTitle>
                        <CardDescription>View live reports from citizens.</CardDescription>
                    </CardHeader>
                    <CardContent>
                    <Button asChild className="w-full">
                        <Link href="/dashboard/feed">View Feed</Link>
                    </Button>
                    </CardContent>
                </Card>
            </div>
        </div>

       <Card className="flex-1 shadow-lg h-full mt-6">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle>My Recent Reports</CardTitle>
            <CardDescription>A summary of issues you've recently reported.</CardDescription>
          </div>
          <Button asChild variant="secondary" size="sm">
            <Link href="/dashboard/my-reports">View All</Link>
          </Button>
        </CardHeader>
        <CardContent>
            {userReports && userReports.length > 0 ? (
                <ul className="space-y-3">
                    {userReports.slice(0,5).map(report => (
                        <li key={report.id} className="flex justify-between items-center text-sm p-3 rounded-lg bg-secondary">
                            <span className="truncate pr-4 font-medium">{report.description}</span>
                            <Badge className={cn('font-semibold', statusStyles[report.status])}>
                                {report.status}
                            </Badge>
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg">
                    <Files className="h-12 w-12 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mt-4">You haven't reported any issues yet.</p>
                    <Button asChild size="sm" className="mt-4">
                        <Link href="/report">Report Your First Issue</Link>
                    </Button>
                </div>
            )}
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
