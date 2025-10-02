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
import MapView from '@/components/home/MapView';
import AqiCard from '@/components/home/AqiCard';
import DisasterAlert from '@/components/home/DisasterAlert';
import { MapProvider } from '@/components/home/MapProvider';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Report } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ReportStatus } from '@/lib/types';
import { mockReports, mockAdmins } from '@/lib/data';

const statusStyles: { [key in ReportStatus]: string } = {
  [ReportStatus.Pending]: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-700',
  [ReportStatus.InProgress]: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-700',
  [ReportStatus.Resolved]: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700',
};


export default function DashboardPage() {
  const { user, isLoading: isUserLoading } = useAuth();
  const router = useRouter();

  const userReports = useMemo(() => {
    if (!user) return [];
    return mockReports.filter(report => report.citizenId === user.id);
  }, [user]);

  const isAdmin = useMemo(() => {
    if (!user) return false;
    return mockAdmins.some(admin => admin.email === user.email);
  }, [user]);


  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
     if (!isUserLoading && user && isAdmin) {
      router.push('/admin'); // Redirect admins to admin dashboard
    }
  }, [user, isAdmin, isUserLoading, router]);

  if (isUserLoading || !user || isAdmin) {
    return (
       <div className="flex-1 w-full p-4 sm:p-6">
        <div className="container mx-auto grid grid-cols-1 xl:grid-cols-12 gap-6 h-full">
            <div className="xl:col-span-8">
                <Skeleton className="h-[400px] xl:h-[calc(100vh-10rem)] w-full rounded-xl" />
            </div>
            <div className="xl:col-span-4 flex flex-col gap-6">
                <Skeleton className="h-[180px] w-full rounded-xl" />
                <Skeleton className="flex-1 w-full rounded-xl" />
                 <Skeleton className="flex-1 w-full rounded-xl" />
            </div>
        </div>
       </div>
    );
  }

  return (
    <div className="flex-1 w-full relative">
      <div className="container mx-auto grid grid-cols-1 xl:grid-cols-12 gap-6 p-4 sm:p-6 h-full">
        <div className="xl:col-span-8 rounded-xl shadow-lg overflow-hidden h-[400px] xl:h-auto flex flex-col bg-card">
          <MapProvider>
            <MapView />
          </MapProvider>
        </div>
        <div className="xl:col-span-4 flex flex-col gap-6">
          <AqiCard />
           <Card className="flex-1 shadow-lg">
            <CardHeader>
              <CardTitle>My Reports</CardTitle>
              <CardDescription>A summary of issues you've reported.</CardDescription>
            </CardHeader>
            <CardContent>
                {userReports && userReports.length > 0 ? (
                    <ul className="space-y-3">
                        {userReports.slice(0,5).map(report => (
                            <li key={report.id} className="flex justify-between items-center text-sm">
                                <span className="truncate pr-4">{report.description}</span>
                                <Badge className={cn('font-semibold', statusStyles[report.status])}>
                                    {report.status}
                                </Badge>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-muted-foreground">You haven't reported any issues yet.</p>
                )}
            </CardContent>
          </Card>
          <Card className="flex-1 shadow-lg">
            <CardHeader>
              <CardTitle>Community Action</CardTitle>
              <CardDescription>Found an issue? Let us know.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full" size="lg">
                <Link href="/report">Report an Issue</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      <DisasterAlert />
    </div>
  );
}
