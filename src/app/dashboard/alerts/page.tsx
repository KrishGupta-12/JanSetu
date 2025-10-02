'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { Alert as AlertType, AlertLevel } from '@/lib/types';
import { collection, query, orderBy } from 'firebase/firestore';
import { format } from 'date-fns';
import { Info, TriangleAlert, Siren, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

const levelStyles: Record<AlertLevel, string> = {
  Info: 'border-blue-500/50 bg-blue-50 dark:bg-blue-900/20',
  Warning: 'border-yellow-500/50 bg-yellow-50 dark:bg-yellow-900/20',
  Critical: 'border-red-500/50 bg-red-50 dark:bg-red-900/20',
};

const levelIconStyles: Record<AlertLevel, string> = {
    Info: 'text-blue-500',
    Warning: 'text-yellow-500',
    Critical: 'text-red-500',
};

const levelIcons: Record<AlertLevel, React.ReactNode> = {
  Info: <Info />,
  Warning: <TriangleAlert />,
  Critical: <Siren />,
};


function AlertsSkeleton() {
    return (
        <div className="space-y-6">
            {Array.from({length: 4}).map((_, i) => (
                <Card key={i} className="shadow-md">
                    <CardHeader className="flex flex-row items-center gap-4">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-4 w-1/4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6 mt-2" />
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

export default function AlertsPage() {
  const firestore = useFirestore();
  const alertsQuery = useMemoFirebase(() => query(collection(firestore, 'alerts'), orderBy('publishDate', 'desc')), [firestore]);
  const { data: alerts, isLoading } = useCollection<AlertType>(alertsQuery);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-headline font-bold tracking-tight">Platform Alerts</h1>
        <p className="text-muted-foreground">
          Stay informed with the latest updates and announcements from the administration.
        </p>
      </div>

      {isLoading ? <AlertsSkeleton /> : (
        <div className="space-y-6">
          {alerts && alerts.length > 0 ? (
            alerts.map(alert => (
              <Card key={alert.id} className={cn('shadow-md', levelStyles[alert.level])}>
                <CardHeader className="flex flex-row items-start gap-4">
                  <div className={cn('mt-1', levelIconStyles[alert.level])}>
                    {levelIcons[alert.level]}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl">{alert.title}</CardTitle>
                    <CardDescription className="text-xs">
                      Published by {alert.adminName} on {format(new Date(alert.publishDate), 'PPP p')}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{alert.description}</p>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="text-center py-12">
              <CardContent className="flex flex-col items-center gap-4 text-muted-foreground">
                <Bell className="h-12 w-12" />
                <h3 className="text-xl font-semibold">No Alerts Yet</h3>
                <p>There are currently no platform-wide alerts. Check back later for updates.</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
