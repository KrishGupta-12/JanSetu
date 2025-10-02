'use client';
import { useAuth } from '@/hooks/useAuth';
import { mockReports } from '@/lib/data';
import { Report, ReportStatus, Resolution } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Star, Eye } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const statusStyles: { [key in ReportStatus]: string } = {
  [ReportStatus.Pending]: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-700',
  [ReportStatus.InProgress]: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-700',
  [ReportStatus.Resolved]: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700',
  [ReportStatus.Rejected]: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700',
  [ReportStatus.PendingCitizenFeedback]: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/50 dark:text-purple-300 dark:border-purple-700',
  [ReportStatus.PendingApproval]: 'bg-pink-100 text-pink-800 border-pink-300 dark:bg-pink-900/50 dark:text-pink-300 dark:border-pink-700',
};

const StarRating = ({ rating, setRating, disabled }: { rating: number, setRating?: (r: number) => void, disabled?: boolean }) => (
    <div className="flex gap-1">
        {[1,2,3,4,5].map(star => (
            <Star 
                key={star} 
                className={cn(
                    'h-5 w-5', 
                    rating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300',
                    !disabled && 'cursor-pointer'
                )}
                onClick={() => !disabled && setRating && setRating(star)}
            />
        ))}
    </div>
)

export default function MyReportsPage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [reports, setReports] = useState<Report[]>(mockReports);
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [isDetailViewOpen, setIsDetailViewOpen] = useState(false);
    
    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login');
        }
    }, [user, isLoading, router]);

    const userReports = useMemo(() => {
        if (!user) return [];
        return reports.filter(r => r.citizenId === user.id);
    }, [user, reports]);

    const handleViewDetails = (report: Report) => {
        setSelectedReport(report);
        setIsDetailViewOpen(true);
    }
    
    const handleSaveFeedback = (reportId: string, rating: number, feedback: string) => {
        setReports(prev => prev.map(r => {
            if (r.id === reportId && r.resolution) {
                return {
                    ...r,
                    status: ReportStatus.PendingApproval,
                    resolution: {
                        ...r.resolution,
                        citizenRating: rating,
                        citizenFeedback: feedback,
                    }
                }
            }
            return r;
        }));
        toast({ title: "Feedback Submitted", description: "Thank you for your feedback!" });
        setIsDetailViewOpen(false);
    }

    if (isLoading || !user) {
        return <div className="container mx-auto py-8"><Skeleton className="h-96 w-full" /></div>;
    }

    return (
        <div className="container mx-auto py-8">
            <Card>
                <CardHeader>
                    <CardTitle className="text-3xl font-headline">My Reports</CardTitle>
                    <CardDescription>Here you can track the status of all the issues you have reported.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {userReports.map(report => (
                                     <TableRow key={report.id}>
                                        <TableCell className="font-medium">{report.id.substring(0, 7)}</TableCell>
                                        <TableCell className="max-w-sm truncate">{report.description}</TableCell>
                                        <TableCell>
                                            <Badge className={cn('font-semibold', statusStyles[report.status])}>{report.status}</Badge>
                                        </TableCell>
                                        <TableCell>{new Date(report.reportDate).toLocaleDateString()}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" onClick={() => handleViewDetails(report)}>
                                                <Eye className="mr-2 h-4 w-4"/> View
                                            </Button>
                                        </TableCell>
                                     </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={isDetailViewOpen} onOpenChange={setIsDetailViewOpen}>
                <ReportDetailsDialog report={selectedReport} user={user} onSaveFeedback={handleSaveFeedback} />
            </Dialog>
        </div>
    )
}


function ReportDetailsDialog({ report, user, onSaveFeedback }: { report: Report | null, user: any, onSaveFeedback: any }) {
    const [rating, setRating] = useState(0);
    const [feedback, setFeedback] = useState("");

    useEffect(() => {
        if (report?.resolution?.citizenRating) {
            setRating(report.resolution.citizenRating);
        }
        if (report?.resolution?.citizenFeedback) {
            setFeedback(report.resolution.citizenFeedback);
        }
    }, [report]);

    if (!report) return null;

    const needsFeedback = report.status === ReportStatus.PendingCitizenFeedback;
    const canEditFeedback = report.citizenId === user.id && needsFeedback;

    return (
         <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
                <DialogTitle>Report Details</DialogTitle>
                <p className="text-sm text-muted-foreground pt-1">
                    Full details for report ID {report.id.substring(0,7)}.
                </p>
            </DialogHeader>
            <div className="grid gap-6 py-4">
                <div className="space-y-4 rounded-lg border p-4">
                    <h4 className="font-semibold text-lg">Initial Report</h4>
                    <div className="grid grid-cols-3 gap-4">
                        <div><p className="text-sm font-medium text-muted-foreground">Status</p><Badge className={cn('font-semibold !mt-1 w-fit', statusStyles[report.status])}>{report.status}</Badge></div>
                        <div><p className="text-sm font-medium text-muted-foreground">Category</p><p className="text-sm">{report.category}</p></div>
                        <div><p className="text-sm font-medium text-muted-foreground">Reported</p><p className="text-sm">{new Date(report.reportDate).toLocaleString()}</p></div>
                        <div className="col-span-3"><p className="text-sm font-medium text-muted-foreground">Description</p><p className="text-sm">{report.description}</p></div>
                    </div>
                    {report.imageUrl && (
                        <div>
                            <p className="text-sm font-medium text-muted-foreground mb-2">Submitted Image</p>
                            <div className="relative h-48 w-full rounded-md overflow-hidden border">
                                <Image src={report.imageUrl} alt="Report Image" fill objectFit="cover" />
                            </div>
                        </div>
                    )}
                </div>
                
                {report.resolution && (
                     <div className="space-y-4 rounded-lg border p-4">
                        <h4 className="font-semibold text-lg">Resolution Details</h4>
                        <div className="grid grid-cols-3 gap-4">
                            <div><p className="text-sm font-medium text-muted-foreground">Resolved By</p><p className="text-sm">{report.resolution.adminName}</p></div>
                            <div><p className="text-sm font-medium text-muted-foreground">Date</p><p className="text-sm">{new Date(report.resolution.date).toLocaleString()}</p></div>
                            <div><p className="text-sm font-medium text-muted-foreground">Cost</p><p className="text-sm font-bold">₹{report.resolution.cost.toLocaleString()}</p></div>
                            <div className="col-span-3"><p className="text-sm font-medium text-muted-foreground">Summary</p><p className="text-sm">{report.resolution.summary}</p></div>
                        </div>
                         {report.resolution.afterImageUrl && (
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-2">Resolution Image</p>
                                <div className="relative h-48 w-full rounded-md overflow-hidden border">
                                    <Image src={report.resolution.afterImageUrl} alt="Resolution Image" fill objectFit="cover" />
                                </div>
                            </div>
                         )}
                    </div>
                )}
                
                {(report.resolution || needsFeedback) && (
                    <div className="space-y-4 rounded-lg border bg-secondary/50 p-4">
                        <h4 className="font-semibold text-lg">Your Feedback</h4>
                         <div className="space-y-2">
                            <Label>Your Rating</Label>
                            <StarRating rating={rating} setRating={setRating} disabled={!canEditFeedback} />
                         </div>
                         <div className="space-y-2">
                            <Label>Your Comments</Label>
                            <Textarea value={feedback} onChange={e => setFeedback(e.target.value)} placeholder="Share your thoughts on the resolution..." disabled={!canEditFeedback} />
                         </div>
                         {canEditFeedback && (
                            <Button onClick={() => onSaveFeedback(report.id, rating, feedback)}>Submit Feedback</Button>
                         )}
                         {!canEditFeedback && !report.resolution?.citizenFeedback && (
                             <p className="text-sm text-muted-foreground">The department has submitted a resolution. You can now provide your feedback.</p>
                         )}
                         {report.status !== ReportStatus.PendingCitizenFeedback && report.resolution?.citizenFeedback && (
                              <p className="text-sm text-muted-foreground">Your feedback has been submitted. Thank you!</p>
                         )}
                    </div>
                )}

                 {report.resolution?.isApproved && (
                     <div className="space-y-4 rounded-lg border bg-green-50 dark:bg-green-900/20 p-4">
                        <h4 className="font-semibold text-lg text-green-800 dark:text-green-300">Final Verdict: Approved</h4>
                         <div className="grid grid-cols-3 gap-4">
                            <div><p className="text-sm font-medium text-muted-foreground">Super Admin Rating</p><StarRating rating={report.resolution.superAdminRating || 0} disabled /></div>
                            <div className="col-span-3"><p className="text-sm font-medium text-muted-foreground">Super Admin Comments</p><p className="text-sm">{report.resolution.superAdminFeedback}</p></div>
                        </div>
                    </div>
                 )}
            </div>
        </DialogContent>
    )
}
