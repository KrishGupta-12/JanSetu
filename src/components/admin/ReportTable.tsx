
'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MoreHorizontal, Loader2, Sparkles, Eye, UserCheck, ShieldX, Check, Star, Siren, Triangle, Square, Circle as LucideCircle, ThumbsUp } from 'lucide-react';
import type { Report, UserProfile, Resolution, ReportUrgency, ReportCategory } from '@/lib/types';
import { ReportStatus, AdminRole, DepartmentAdminRoles } from '@/lib/types';
import { cn } from '@/lib/utils';
import { summarizeReports } from '@/ai/flows/summarize-reports';
import { useToast } from '@/hooks/use-toast';
import { reportCategories } from '@/lib/data';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, doc } from 'firebase/firestore';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';


const statusStyles: { [key in ReportStatus]: string } = {
  [ReportStatus.Pending]: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-700',
  [ReportStatus.InProgress]: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-700',
  [ReportStatus.Resolved]: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700',
  [ReportStatus.Rejected]: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700',
  [ReportStatus.PendingCitizenFeedback]: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/50 dark:text-purple-300 dark:border-purple-700',
  [ReportStatus.PendingApproval]: 'bg-pink-100 text-pink-800 border-pink-300 dark:bg-pink-900/50 dark:text-pink-300 dark:border-pink-700',
};

const urgencyStyles: { [key in ReportUrgency]: string } = {
    'Low': 'bg-gray-100 text-gray-800 border-gray-300',
    'Medium': 'bg-yellow-100 text-yellow-800 border-yellow-300',
    'High': 'bg-orange-100 text-orange-800 border-orange-300',
    'Critical': 'bg-red-100 text-red-800 border-red-300',
}

const urgencyIcons: { [key in ReportUrgency]: React.ReactNode } = {
    'Low': <LucideCircle className="h-3 w-3" />,
    'Medium': <Triangle className="h-3 w-3" />,
    'High': <Square className="h-3 w-3" />,
    'Critical': <Siren className="h-3 w-3" />,
}

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

export default function ReportTable({ reports, admin }: { reports: Report[], admin: UserProfile }) {
  const [summary, setSummary] = useState('');
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [isSummaryDialogOpen, setIsSummaryDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isDetailViewOpen, setIsDetailViewOpen] = useState(false);
  const [isResolutionFormOpen, setIsResolutionFormOpen] = useState(false);
  const [urgencyFilter, setUrgencyFilter] = useState<ReportUrgency | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<ReportCategory | 'all'>('all');

  const { toast } = useToast();
  const firestore = useFirestore();

  const adminsQuery = useMemoFirebase(() => query(collection(firestore, 'users')), [firestore]);
  const { data: allAdmins } = useCollection<UserProfile>(adminsQuery);


  const filteredReports = useMemo(() => {
    let filtered = reports;
    if (urgencyFilter !== 'all') {
      filtered = filtered.filter(r => r.urgency === urgencyFilter);
    }
    if (categoryFilter !== 'all') {
        filtered = filtered.filter(r => r.category === categoryFilter);
    }
    return filtered;
  }, [reports, urgencyFilter, categoryFilter]);
  
  const handleUpdateStatus = (reportId: string, status: ReportStatus) => {
    const reportDocRef = doc(firestore, 'issueReports', reportId);
    updateDocumentNonBlocking(reportDocRef, { status });

    toast({
      title: 'Status Updated',
      description: `Report status changed to ${status}.`
    });
  }
  
  const handleUpdateUrgency = (reportId: string, urgency: ReportUrgency) => {
    const reportDocRef = doc(firestore, 'issueReports', reportId);
    updateDocumentNonBlocking(reportDocRef, { urgency });
    toast({
      title: 'Urgency Updated',
      description: `Report urgency changed to ${urgency}.`
    });
  }

  const handleAssignAdmin = (reportId: string, assignedAdmin: UserProfile) => {
    const reportDocRef = doc(firestore, 'issueReports', reportId);
     updateDocumentNonBlocking(reportDocRef, {
        assignedAdminId: assignedAdmin.uid,
        assignedAdminName: assignedAdmin.name,
        status: ReportStatus.InProgress, 
      });

     toast({
      title: 'Report Assigned',
      description: `Report has been assigned to ${assignedAdmin.name}.`
    });
  }

  const handleGenerateSummary = async () => {
    setIsSummaryLoading(true);
    setSummary('');

    if (reports.length === 0) {
        setSummary("No reports to summarize.");
        setIsSummaryDialogOpen(true);
        setIsSummaryLoading(false);
        return;
    }

    try {
        const reportsForSummary = reports.map(report => ({
            category: report.category,
            description: report.description,
            location: `${report.latitude}, ${report.longitude}`,
        }));
        const result = await summarizeReports({ reports: reportsForSummary });
        setSummary(result.summary);
    } catch (e) {
        console.error(e);
        setSummary("Failed to generate summary.");
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not generate summary.",
        });
    }

    setIsSummaryDialogOpen(true);
    setIsSummaryLoading(false);
  };
  
  const handleViewDetails = (report: Report) => {
      setSelectedReport(report);
      setIsDetailViewOpen(true);
  }

  const handleOpenResolutionForm = (report: Report) => {
    setSelectedReport(report);
    setIsResolutionFormOpen(true);
  }
  
  const handleSaveResolution = (reportId: string, resolutionData: Omit<Resolution, 'adminId' | 'adminName' | 'date'>) => {
    const reportDocRef = doc(firestore, 'issueReports', reportId);
    const updateData = {
      status: ReportStatus.PendingCitizenFeedback,
      resolution: {
        ...resolutionData,
        adminId: admin.uid,
        adminName: admin.name,
        date: new Date().toISOString(),
      }
    };
    updateDocumentNonBlocking(reportDocRef, updateData);
    setIsResolutionFormOpen(false);
    toast({ title: "Resolution Submitted", description: "Waiting for citizen feedback."});
  }

  const handleApproveWork = (reportId: string) => {
    const reportDocRef = doc(firestore, 'issueReports', reportId);
     updateDocumentNonBlocking(reportDocRef, { 
       status: ReportStatus.Resolved,
       'resolution.isApproved': true 
      });
     toast({ title: "Work Approved", description: "This report is now marked as resolved."});
     setIsDetailViewOpen(false);
  }

  const urgencyLevels: ReportUrgency[] = ['Low', 'Medium', 'High', 'Critical'];


  return (
    <>
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle>
              {admin.role === AdminRole.SuperAdmin ? 'Reports' : 'Assigned Reports'}
            </CardTitle>
          </div>
          <div className="flex flex-wrap items-center gap-2">
             <Select value={urgencyFilter} onValueChange={(value) => setUrgencyFilter(value as any)}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by urgency" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Urgencies</SelectItem>
                    {urgencyLevels.map(level => (
                    <SelectItem key={level} value={level}>{level}</SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {admin.role === AdminRole.SuperAdmin && (
              <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as any)}>
                  <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {reportCategories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                  </SelectContent>
              </Select>
            )}

            {admin.role === AdminRole.SuperAdmin && reports.length > 0 && (
              <Button onClick={handleGenerateSummary} disabled={isSummaryLoading}>
                {isSummaryLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Generate Summary
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID / Urgency</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Upvotes</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reported On</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">
                        <div>{report.id.substring(0, 7)}...</div>
                        {report.urgency && (
                            <Badge className={cn('font-semibold gap-1 pl-1.5', urgencyStyles[report.urgency])}>
                                {urgencyIcons[report.urgency]}
                                {report.urgency}
                            </Badge>
                        )}
                    </TableCell>
                    <TableCell>{report.category}</TableCell>
                    <TableCell>
                        <div className="flex items-center gap-1 font-semibold">
                            <ThumbsUp className="h-4 w-4 text-muted-foreground" />
                            {report.upvotes}
                        </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{report.description}</TableCell>
                    <TableCell>{report.assignedAdminName || 'Unassigned'}</TableCell>
                    <TableCell>
                      <Badge className={cn('font-semibold', statusStyles[report.status])}>
                        {report.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {report.reportDate ? new Date(report.reportDate).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleViewDetails(report)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {admin.role === AdminRole.SuperAdmin ? (
                           <>
                            <DropdownMenuSub>
                              <DropdownMenuSubTrigger>
                                <UserCheck className="mr-2 h-4 w-4" />
                                Assign To
                              </DropdownMenuSubTrigger>
                              <DropdownMenuSubContent>
                                {allAdmins?.filter(a => a.role && DepartmentAdminRoles.includes(a.role)).map(deptAdmin => (
                                  <DropdownMenuItem key={deptAdmin.uid} onClick={() => handleAssignAdmin(report.id, deptAdmin)}>
                                    {deptAdmin.name} ({deptAdmin.department})
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuSubContent>
                            </DropdownMenuSub>
                            <DropdownMenuSub>
                              <DropdownMenuSubTrigger>
                                <Siren className="mr-2 h-4 w-4" />
                                Set Urgency
                              </DropdownMenuSubTrigger>
                              <DropdownMenuSubContent>
                                {urgencyLevels.map(level => (
                                  <DropdownMenuItem key={level} onClick={() => handleUpdateUrgency(report.id, level)}>
                                    {level}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuSubContent>
                            </DropdownMenuSub>
                             <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleUpdateStatus(report.id, ReportStatus.Rejected)}>
                                <ShieldX className="mr-2 h-4 w-4" />
                                Mark as Rejected
                              </DropdownMenuItem>
                           </>
                          ) : (
                            <>
                              <DropdownMenuItem 
                                onClick={() => handleUpdateStatus(report.id, ReportStatus.InProgress)}
                                disabled={report.status !== ReportStatus.Pending}
                              >
                                Mark as In Progress
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleOpenResolutionForm(report)}>
                                  Mark as Resolved
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleUpdateStatus(report.id, ReportStatus.Rejected)}>
                                <ShieldX className="mr-2 h-4 w-4" />
                                Mark as Rejected
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={isSummaryDialogOpen} onOpenChange={setIsSummaryDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>AI-Generated Report Summary</AlertDialogTitle>
            <AlertDialogDescription className="text-foreground whitespace-pre-wrap max-h-[60vh] overflow-y-auto">
              {summary}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setIsSummaryDialogOpen(false)}>Close</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <Dialog open={isDetailViewOpen} onOpenChange={setIsDetailViewOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
            {selectedReport && (
                <>
                <DialogHeader>
                    <DialogTitle>Report Details</DialogTitle>
                    <p className="text-sm text-muted-foreground pt-1">
                        Full details for report ID {selectedReport.id.substring(0,7)}.
                     </p>
                </DialogHeader>
                 <div className="grid gap-6 py-4">
                    <div className="space-y-4 rounded-lg border p-4">
                        <h4 className="font-semibold text-lg">Initial Report</h4>
                        <div className="grid grid-cols-3 gap-4">
                            <div><p className="text-sm font-medium text-muted-foreground">Status</p><Badge className={cn('font-semibold !mt-1 w-fit', statusStyles[selectedReport.status])}>{selectedReport.status}</Badge></div>
                            <div><p className="text-sm font-medium text-muted-foreground">Category</p><p className="text-sm">{selectedReport.category}</p></div>
                            <div><p className="text-sm font-medium text-muted-foreground">Reported</p><p className="text-sm">{new Date(selectedReport.reportDate).toLocaleString()}</p></div>
                             <div>
                                <p className="text-sm font-medium text-muted-foreground">Urgency</p>
                                {selectedReport.urgency ? (
                                    <Badge className={cn('font-semibold !mt-1 w-fit gap-1 pl-1.5', urgencyStyles[selectedReport.urgency])}>
                                        {urgencyIcons[selectedReport.urgency]}
                                        {selectedReport.urgency}
                                    </Badge>
                                ) : (
                                    <p className="text-sm">Not set</p>
                                )}
                             </div>
                            <div><p className="text-sm font-medium text-muted-foreground">Assigned To</p><p className="text-sm">{selectedReport.assignedAdminName || 'Unassigned'}</p></div>
                            <div className="col-span-1"><p className="text-sm font-medium text-muted-foreground">Location</p><a href={`https://www.google.com/maps/search/?api=1&query=${selectedReport.latitude},${selectedReport.longitude}`} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">{selectedReport.latitude}, {selectedReport.longitude}</a></div>
                            <div className="col-span-3"><p className="text-sm font-medium text-muted-foreground">Description</p><p className="text-sm">{selectedReport.description}</p></div>
                        </div>
                        {selectedReport.imageUrl && (
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-2">Submitted Image</p>
                                <div className="relative h-48 w-full rounded-md overflow-hidden border">
                                    <Image src={selectedReport.imageUrl} alt="Report Image" fill objectFit="cover" />
                                </div>
                            </div>
                        )}
                    </div>
                    
                    {selectedReport.resolution && (
                         <div className="space-y-4 rounded-lg border p-4">
                            <h4 className="font-semibold text-lg">Resolution Details</h4>
                            <div className="grid grid-cols-3 gap-4">
                                <div><p className="text-sm font-medium text-muted-foreground">Resolved By</p><p className="text-sm">{selectedReport.resolution.adminName}</p></div>
                                <div><p className="text-sm font-medium text-muted-foreground">Date</p><p className="text-sm">{new Date(selectedReport.resolution.date).toLocaleString()}</p></div>
                                <div><p className="text-sm font-medium text-muted-foreground">Cost</p><p className="text-sm font-bold">Rs.{selectedReport.resolution.cost.toLocaleString()}</p></div>
                                <div className="col-span-3"><p className="text-sm font-medium text-muted-foreground">Summary</p><p className="text-sm">{selectedReport.resolution.summary}</p></div>
                                <div className="col-span-3"><p className="text-sm font-medium text-muted-foreground">Cost Breakdown</p><p className="text-sm whitespace-pre-wrap">{selectedReport.resolution.costBreakdown}</p></div>
                            </div>
                             {selectedReport.resolution.afterImageUrl && (
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground mb-2">Resolution Image</p>
                                    <div className="relative h-48 w-full rounded-md overflow-hidden border">
                                        <Image src={selectedReport.resolution.afterImageUrl} alt="Resolution Image" fill objectFit="cover" />
                                    </div>
                                </div>
                             )}
                        </div>
                    )}
                    
                    {selectedReport.resolution?.citizenFeedback && (
                        <div className="space-y-4 rounded-lg border bg-secondary/50 p-4">
                            <h4 className="font-semibold text-lg">Citizen Feedback</h4>
                             <div className="grid grid-cols-3 gap-4">
                                <div><p className="text-sm font-medium text-muted-foreground">Rating</p><StarRating rating={selectedReport.resolution.citizenRating || 0} disabled /></div>
                                <div className="col-span-3"><p className="text-sm font-medium text-muted-foreground">Comments</p><p className="text-sm">{selectedReport.resolution.citizenFeedback}</p></div>
                            </div>
                        </div>
                    )}
                    
                     {admin.role === AdminRole.SuperAdmin && selectedReport.status === ReportStatus.PendingApproval && (
                        <div className="space-y-4 rounded-lg border p-4">
                             <h4 className="font-semibold text-lg">Super Admin Verdict</h4>
                             <p className="text-sm text-muted-foreground">Provide your feedback and approve the work.</p>
                             <div className="space-y-2">
                                <Label>Rating</Label>
                                <StarRating rating={0} />
                             </div>
                             <div className="space-y-2">
                                <Label>Feedback</Label>
                                <Textarea placeholder="Your feedback for the department..."/>
                             </div>
                             <Button onClick={() => handleApproveWork(selectedReport.id)}>
                                <Check className="mr-2 h-4 w-4"/> Approve Work
                             </Button>
                        </div>
                     )}

                     {selectedReport.resolution?.isApproved && (
                         <div className="space-y-4 rounded-lg border bg-green-50 dark:bg-green-900/20 p-4">
                            <h4 className="font-semibold text-lg text-green-800 dark:text-green-300">Final Verdict: Approved</h4>
                             <div className="grid grid-cols-3 gap-4">
                                <div><p className="text-sm font-medium text-muted-foreground">Super Admin Rating</p><StarRating rating={selectedReport.resolution.superAdminRating || 0} disabled /></div>
                                <div className="col-span-3"><p className="text-sm font-medium text-muted-foreground">Super Admin Comments</p><p className="text-sm">{selectedReport.resolution.superAdminFeedback}</p></div>
                            </div>
                        </div>
                     )}
                 </div>
                </>
            )}
        </DialogContent>
      </Dialog>
      <Dialog open={isResolutionFormOpen} onOpenChange={setIsResolutionFormOpen}>
          <ResolutionForm 
            report={selectedReport} 
            admin={admin} 
            onClose={() => setIsResolutionFormOpen(false)}
            onSave={handleSaveResolution}
           />
      </Dialog>
    </>
  );
}


function ResolutionForm({ report, admin, onClose, onSave }: { report: Report | null, admin: UserProfile, onClose: () => void, onSave: (reportId: string, data: any) => void }) {
    const [summary, setSummary] = useState('');
    const [cost, setCost] = useState(0);
    const [costBreakdown, setCostBreakdown] = useState('');
    const [afterImageUrl, setAfterImageUrl] = useState('');
    
    if (!report) return null;

    const handleSubmit = () => {
        // Basic validation
        if (!summary || cost <= 0 || !costBreakdown) {
            alert("Please fill all fields.");
            return;
        }
        onSave(report.id, { summary, cost, costBreakdown, afterImageUrl });
    }

    return (
        <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
                <DialogTitle>Submit Resolution for Report #{report.id.substring(0, 7)}</DialogTitle>
                 <p className="text-sm text-muted-foreground pt-1">
                    Provide details of the work done to resolve this issue.
                 </p>
            </DialogHeader>
            <div className="grid gap-6 py-4">
                <div className="space-y-2">
                    <Label htmlFor="summary">Resolution Summary</Label>
                    <Textarea id="summary" value={summary} onChange={e => setSummary(e.target.value)} placeholder="Describe the work that was done..."/>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="cost">Total Cost (Rs.)</Label>
                        <Input id="cost" type="number" value={cost} onChange={e => setCost(Number(e.target.value))}/>
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="costBreakdown">Cost Breakdown</Label>
                    <Textarea id="costBreakdown" value={costBreakdown} onChange={e => setCostBreakdown(e.target.value)} placeholder="e.g., Materials: Rs.500, Labor: Rs.1000"/>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="afterImage">"After" Photo URL (Optional)</Label>
                    <Input id="afterImage" value={afterImageUrl} onChange={e => setAfterImageUrl(e.target.value)} placeholder="https://example.com/image.jpg" />
                </div>
            </div>
            <AlertDialogFooter>
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button onClick={handleSubmit}>Submit Resolution</Button>
            </AlertDialogFooter>
        </DialogContent>
    )
}
