'use client';
import { useAuth } from '@/hooks/useAuth';
import { mockReports } from '@/lib/data';
import { Report, ReportStatus, Resolution, User } from '@/lib/types';
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
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ReportDetailsDialog from '@/components/dashboard/ReportDetailsDialog';

const statusStyles: { [key in ReportStatus]: string } = {
  [ReportStatus.Pending]: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-700',
  [ReportStatus.InProgress]: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-700',
  [ReportStatus.Resolved]: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700',
  [ReportStatus.Rejected]: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700',
  [ReportStatus.PendingCitizenFeedback]: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/50 dark:text-purple-300 dark:border-purple-700',
  [ReportStatus.PendingApproval]: 'bg-pink-100 text-pink-800 border-pink-300 dark:bg-pink-900/50 dark:text-pink-300 dark:border-pink-700',
};


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
