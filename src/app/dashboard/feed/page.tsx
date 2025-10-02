'use client';
import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Report, UserProfile, ReportStatus } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ThumbsUp, Eye } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Dialog } from '@/components/ui/dialog';
import ReportDetailsDialog from '@/components/dashboard/ReportDetailsDialog';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';

const statusStyles: { [key in ReportStatus]: string } = {
  [ReportStatus.Pending]: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-700',
  [ReportStatus.InProgress]: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-700',
  [ReportStatus.Resolved]: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700',
  [ReportStatus.Rejected]: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700',
  [ReportStatus.PendingCitizenFeedback]: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/50 dark:text-purple-300 dark:border-purple-700',
  [ReportStatus.PendingApproval]: 'bg-pink-100 text-pink-800 border-pink-300 dark:bg-pink-900/50 dark:text-pink-300 dark:border-pink-700',
};


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
    const { user, isLoading: isUserLoading } = useAuth();
    const firestore = useFirestore();

    const reportsQuery = useMemoFirebase(() => query(collection(firestore, 'issueReports'), orderBy('reportDate', 'desc')), [firestore]);
    const { data: reports, isLoading: isReportsLoading } = useCollection<Report>(reportsQuery);

    const usersQuery = useMemoFirebase(() => collection(firestore, 'users'), [firestore]);
    const { data: users, isLoading: isUsersLoading } = useCollection<UserProfile>(usersQuery);

    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [isDetailViewOpen, setIsDetailViewOpen] = useState(false);

    const enrichedReports = useMemo(() => {
        if (!reports || !users) return [];
        return reports.map(report => {
            const citizen = users.find(u => u.uid === report.citizenId);
            return { ...report, citizen };
        });
    }, [reports, users]);

    const handleUpvote = (reportId: string) => {
        if (!user) return;
        const reportRef = doc(firestore, 'issueReports', reportId);
        const report = reports?.find(r => r.id === reportId);
        
        if (report && report.citizenIdsWhoUpvoted.includes(user.uid)) {
            // Already upvoted, so remove upvote
            updateDocumentNonBlocking(reportRef, {
                upvotes: report.upvotes - 1,
                citizenIdsWhoUpvoted: arrayRemove(user.uid),
            });
        } else if (report) {
            // Not upvoted, so add upvote
            updateDocumentNonBlocking(reportRef, {
                upvotes: report.upvotes + 1,
                citizenIdsWhoUpvoted: arrayUnion(user.uid),
            });
        }
    };
    
    const handleSaveFeedback = (reportId: string, rating: number, feedback: string) => {
        const reportDocRef = doc(firestore, 'issueReports', reportId);
        const updateData = {
            'resolution.citizenRating': rating,
            'resolution.citizenFeedback': feedback,
            'status': ReportStatus.PendingApproval
        };
        updateDocumentNonBlocking(reportDocRef, updateData);
        setIsDetailViewOpen(false);
    };

    const handleViewDetails = (report: Report) => {
        setSelectedReport(report);
        setIsDetailViewOpen(true);
    };

    const isLoading = isUserLoading || isReportsLoading || isUsersLoading;

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
                    {enrichedReports.map(report => (
                        <Card key={report.id} className="shadow-md">
                            <CardHeader className="flex flex-row items-start gap-4">
                                <Avatar className="h-12 w-12">
                                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${report.citizen?.name}`} />
                                    <AvatarFallback>{report.citizen?.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className='flex-1'>
                                    <p className="font-semibold">{report.citizen?.name || 'Anonymous'}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {report.reportDate ? formatDistanceToNow(new Date(report.reportDate), { addSuffix: true }) : 'Just now'}
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
                                <div className="flex items-center justify-between pt-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleUpvote(report.id)}
                                        disabled={!user}
                                    >
                                        <ThumbsUp className={cn("mr-2 h-4 w-4", user && report.citizenIdsWhoUpvoted.includes(user.uid) ? "text-primary fill-primary" : "")} />
                                        Upvote ({report.upvotes})
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => handleViewDetails(report)}>
                                        <Eye className="mr-2 h-4 w-4"/> View Details
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                 </div>
            )}
            <Dialog open={isDetailViewOpen} onOpenChange={setIsDetailViewOpen}>
                <ReportDetailsDialog report={selectedReport} user={user} onSaveFeedback={handleSaveFeedback} />
            </Dialog>
        </div>
    );
}
