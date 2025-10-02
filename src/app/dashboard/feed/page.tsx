'use client';
import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockReports, mockCitizens } from '@/lib/data';
import { Report, Citizen, ReportStatus } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

const statusStyles: { [key in ReportStatus]: string } = {
  [ReportStatus.Pending]: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-700',
  [ReportStatus.InProgress]: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-700',
  [ReportStatus.Resolved]: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700',
  [ReportStatus.Rejected]: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700',
  [ReportStatus.PendingCitizenFeedback]: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/50 dark:text-purple-300 dark:border-purple-700',
  [ReportStatus.PendingApproval]: 'bg-pink-100 text-pink-800 border-pink-300 dark:bg-pink-900/50 dark:text-pink-300 dark:border-pink-700',
};

type EnrichedReport = Report & { citizen?: Citizen };

function FeedSkeleton() {
    return (
        <div className="space-y-6">
            {Array.from({length: 3}).map((_, i) => (
                 <Card key={i}>
                    <CardHeader className="flex flex-row items-center gap-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2">
                           <Skeleton className="h-4 w-48" />
                           <Skeleton className="h-3 w-32" />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-48 w-full rounded-md" />
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

export default function CommunityFeedPage() {
    const [isLoading, setIsLoading] = useState(true);
    const reports = useMemo(() => {
        return mockReports
            .map(report => {
                const citizen = mockCitizens.find(c => c.id === report.citizenId);
                return { ...report, citizen };
            })
            .sort((a, b) => new Date(b.reportDate).getTime() - new Date(a.reportDate).getTime());
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 500);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-headline font-bold tracking-tight">Community Feed</h1>
                <p className="text-muted-foreground">
                    See the latest issues being reported by citizens across the city.
                </p>
            </div>
            {isLoading ? <FeedSkeleton /> : (
                 <div className="space-y-6 max-w-3xl mx-auto">
                    {reports.map(report => (
                        <Card key={report.id} className="shadow-md">
                            <CardHeader className="flex flex-row items-center gap-4">
                                <Avatar className="h-12 w-12">
                                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${report.citizen?.name}`} />
                                    <AvatarFallback>{report.citizen?.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold">{report.citizen?.name || 'Anonymous'}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {formatDistanceToNow(new Date(report.reportDate), { addSuffix: true })}
                                    </p>
                                </div>
                                <Badge className={cn("ml-auto", statusStyles[report.status])}>{report.status}</Badge>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="font-semibold text-lg">{report.category}</p>
                                <p>{report.description}</p>
                                {report.imageUrl && (
                                    <div className="relative aspect-video w-full rounded-md overflow-hidden border">
                                        <Image src={report.imageUrl} alt="Report Image" layout="fill" objectFit="cover" />
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                 </div>
            )}
        </div>
    );
}
