'use client';

import { useState } from 'react';
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
import { MoreHorizontal, Loader2, Sparkles, Eye, UserCheck, ShieldX } from 'lucide-react';
import type { Report, Admin } from '@/lib/types';
import { ReportStatus, AdminRole } from '@/lib/types';
import { cn } from '@/lib/utils';
import { summarizeAllReports } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { mockAdmins } from '@/lib/data';


const statusStyles: { [key in ReportStatus]: string } = {
  [ReportStatus.Pending]: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-700',
  [ReportStatus.InProgress]: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-700',
  [ReportStatus.Resolved]: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700',
  [ReportStatus.Rejected]: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700',
};

export default function ReportTable({ reports: initialReports, admin }: { reports: Report[], admin: Admin }) {
  const [reports, setReports] = useState(initialReports);
  const [summary, setSummary] = useState('');
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [isSummaryDialogOpen, setIsSummaryDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isDetailViewOpen, setIsDetailViewOpen] = useState(false);
  
  const { toast } = useToast();

  const allAdmins = mockAdmins;
  
  const handleUpdateStatus = (reportId: string, status: ReportStatus) => {
    // This would be an API call in a real app
    setReports(prevReports => prevReports.map(r => r.id === reportId ? {...r, status} : r));
    toast({
      title: 'Status Updated',
      description: `Report status changed to ${status}.`
    });
  }

  const handleAssignAdmin = (reportId: string, admin: Admin) => {
    // This would be an API call in a real app
     setReports(prevReports => prevReports.map(r => r.id === reportId ? {
        ...r, 
        assignedAdminId: admin.id,
        assignedAdminName: admin.name,
        status: ReportStatus.InProgress, 
      } : r));

     toast({
      title: 'Report Assigned',
      description: `Report has been assigned to ${admin.name}.`
    });
  }

  const handleGenerateSummary = async () => {
    setIsSummaryLoading(true);
    setSummary('');
    const result = await summarizeAllReports();
    if ('summary' in result) {
      setSummary(result.summary);
      setIsSummaryDialogOpen(true);
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error,
      });
    }
    setIsSummaryLoading(false);
  };
  
  const handleViewDetails = (report: Report) => {
      setSelectedReport(report);
      setIsDetailViewOpen(true);
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            {admin.role === AdminRole.SuperAdmin ? 'All Reports' : 'Assigned Reports'}
          </CardTitle>
          {admin.role === AdminRole.SuperAdmin && (
            <Button onClick={handleGenerateSummary} disabled={isSummaryLoading}>
              {isSummaryLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              Generate Summary
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reported On</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">{report.id.substring(0, 7)}...</TableCell>
                    <TableCell>{report.category}</TableCell>
                    <TableCell className="max-w-xs truncate">{report.description}</TableCell>
                    <TableCell>{report.assignedAdminName || 'Unassigned'}</TableCell>
                    <TableCell>
                      <Badge className={cn('font-semibold', statusStyles[report.status])}>
                        {report.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(report.reportDate).toLocaleDateString()}
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
                            <DropdownMenuSub>
                              <DropdownMenuSubTrigger>
                                <UserCheck className="mr-2 h-4 w-4" />
                                Assign To
                              </DropdownMenuSubTrigger>
                              <DropdownMenuSubContent>
                                {allAdmins?.filter(a => a.role === AdminRole.DepartmentAdmin).map(deptAdmin => (
                                  <DropdownMenuItem key={deptAdmin.id} onClick={() => handleAssignAdmin(report.id, deptAdmin)}>
                                    {deptAdmin.name} ({deptAdmin.department})
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuSubContent>
                            </DropdownMenuSub>
                          ) : (
                            <>
                              <DropdownMenuItem onClick={() => handleUpdateStatus(report.id, ReportStatus.InProgress)}>Mark as In Progress</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleUpdateStatus(report.id, ReportStatus.Resolved)}>Mark as Resolved</DropdownMenuItem>
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
        <DialogContent className="sm:max-w-lg">
            {selectedReport && (
                <>
                <DialogHeader>
                    <DialogTitle>Report Details</DialogTitle>
                    <p className="text-sm text-muted-foreground pt-1">
                        Full details for report ID {selectedReport.id.substring(0,7)}.
                     </p>
                     <Badge className={cn('font-semibold !mt-2 w-fit', statusStyles[selectedReport.status])}>
                        {selectedReport.status}
                    </Badge>
                </DialogHeader>
                 <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                       <p className="col-span-1 text-sm font-medium text-muted-foreground">ID</p>
                       <p className="col-span-3 text-sm">{selectedReport.id}</p>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                       <p className="col-span-1 text-sm font-medium text-muted-foreground">Category</p>
                       <p className="col-span-3 text-sm">{selectedReport.category}</p>
                    </div>
                     <div className="grid grid-cols-4 items-start gap-4">
                       <p className="col-span-1 text-sm font-medium text-muted-foreground pt-1">Description</p>
                       <p className="col-span-3 text-sm">{selectedReport.description}</p>
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                       <p className="col-span-1 text-sm font-medium text-muted-foreground">Assigned To</p>
                       <p className="col-span-3 text-sm">{selectedReport.assignedAdminName || 'Unassigned'}</p>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                       <p className="col-span-1 text-sm font-medium text-muted-foreground">Location</p>
                       <a 
                        href={`https://www.google.com/maps/search/?api=1&query=${selectedReport.latitude},${selectedReport.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="col-span-3 text-sm text-primary hover:underline"
                        >
                           {selectedReport.latitude}, {selectedReport.longitude}
                       </a>
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                       <p className="col-span-1 text-sm font-medium text-muted-foreground">Reported On</p>
                       <p className="col-span-3 text-sm">{new Date(selectedReport.reportDate).toLocaleString()}</p>
                    </div>

                    {selectedReport.imageUrl && (
                        <div>
                             <p className="text-sm font-medium text-muted-foreground mb-2">Image</p>
                             <div className="relative h-64 w-full rounded-md overflow-hidden border">
                                <Image src={selectedReport.imageUrl} alt="Report Image" fill objectFit="cover" />
                             </div>
                        </div>
                    )}
                 </div>
                </>
            )}
        </DialogContent>
      </Dialog>
    </>
  );
}
