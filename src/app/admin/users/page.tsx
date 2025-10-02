
'use client';

import { UserProfile, Report, ReportStatus, UserRole } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  DropdownMenuSubContent,
  DropdownMenuSubTrigger
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useState, useEffect, useMemo } from 'react';
import { ShieldAlert, MoreHorizontal, Ban, RotateCcw } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { add } from 'date-fns';
import { useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { collection, query, doc, orderBy, where } from 'firebase/firestore';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';

type EnrichedCitizen = UserProfile & {
  rejectedReports: number;
  isFlagged: boolean;
  isBanned: boolean;
};

function UserTableSkeleton() {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-8 w-1/4" />
            </CardHeader>
            <CardContent>
                 <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead><Skeleton className="h-6 w-full" /></TableHead>
                                <TableHead><Skeleton className="h-6 w-full" /></TableHead>
                                <TableHead><Skeleton className="h-6 w-full" /></TableHead>
                                <TableHead><Skeleton className="h-6 w-full" /></TableHead>
                                <TableHead><Skeleton className="h-6 w-full" /></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-10 w-full" /></TableCell>
                                    <TableCell><Skeleton className="h-10 w-full" /></TableCell>
                                    <TableCell><Skeleton className="h-10 w-full" /></TableCell>
                                    <TableCell><Skeleton className="h-10 w-full" /></TableCell>
                                    <TableCell><Skeleton className="h-10 w-full" /></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                 </div>
            </CardContent>
        </Card>
    )
}

function UserRow({ citizen, reports, onBan, onUnban, banDurations }: { citizen: UserProfile, reports: Report[], onBan: any, onUnban: any, banDurations: any[] }) {
    const { isBanned, rejectedReports, isFlagged } = useMemo(() => {
        const userReports = reports.filter(report => report.citizenId === citizen.uid);
        const rejected = userReports.filter(report => report.status === ReportStatus.Rejected).length;
        const flagged = rejected >= 5;
        const banned = !!citizen.bannedUntil && (citizen.bannedUntil === 'lifetime' || new Date(citizen.bannedUntil) > new Date());
        return { isBanned: banned, rejectedReports: rejected, isFlagged: flagged };
    }, [citizen, reports]);


    return (
        <TableRow className={isFlagged && !isBanned ? 'bg-red-50 dark:bg-red-900/20' : ''}>
            <TableCell>
                <div className="flex items-center gap-3">
                    <Avatar>
                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${citizen.name}`} />
                        <AvatarFallback>{citizen.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex items-center gap-2">
                        <span className="font-medium">{citizen.name}</span>
                        {isFlagged && (
                            <Badge variant="destructive" className="items-center gap-1">
                                <ShieldAlert className="h-3 w-3" /> Flagged
                            </Badge>
                        )}
                        {isBanned && (
                            <Badge variant="destructive" className="items-center gap-1">
                                <Ban className="h-3 w-3" /> Banned
                            </Badge>
                        )}
                    </div>
                </div>
            </TableCell>
            <TableCell>{citizen.email}</TableCell>
            <TableCell>
                <div className="font-medium text-center">{rejectedReports}</div>
            </TableCell>
            <TableCell>
                {new Date(citizen.dateJoined).toLocaleDateString()}
                {isBanned && (
                    <p className="text-xs text-destructive">
                        {citizen.bannedUntil === 'lifetime' ? 'Banned for life' : `Banned until ${new Date(citizen.bannedUntil!).toLocaleDateString()}`}
                    </p>
                )}
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
                        <DropdownMenuLabel>Admin Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {isBanned ? (
                            <DropdownMenuItem onClick={() => onUnban(citizen.uid)}>
                                <RotateCcw className="mr-2 h-4 w-4" />
                                Unban User
                            </DropdownMenuItem>
                        ) : (
                            <DropdownMenuSub>
                                <DropdownMenuSubTrigger>
                                    <Ban className="mr-2 h-4 w-4" />
                                    Ban User
                                </DropdownMenuSubTrigger>
                                <DropdownMenuSubContent>
                                    <DropdownMenuLabel>Select Duration</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {banDurations.map(d => (
                                        <DropdownMenuItem key={d.label} onClick={() => onBan(citizen.uid, d.duration)}>
                                            {d.label}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuSubContent>
                            </DropdownMenuSub>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </TableCell>
        </TableRow>
    );
}

function CitizenProfile({ citizenId, reports, ...props }: { citizenId: string, reports: Report[], [key: string]: any }) {
    const { firestore } = useAuth();
    const citizenDocRef = useMemoFirebase(() => firestore ? doc(firestore, 'users', citizenId) : null, [firestore, citizenId]);
    const { data: citizen, isLoading } = useDoc<UserProfile>(citizenDocRef);

    if (isLoading || !citizen) {
        return (
             <TableRow>
                <TableCell colSpan={5}><Skeleton className="h-10 w-full" /></TableCell>
             </TableRow>
        );
    }
    
    return <UserRow citizen={citizen} reports={reports} {...props} />;
}


export default function UsersPage() {
  const { user: adminUser, isLoading: isUserLoading, firestore } = useAuth();
  const { toast } = useToast();
  
  // ROOT CAUSE FIX: Fetch reports, not users. This is secure.
  const reportsQuery = useMemoFirebase(() => {
    if (!firestore || !adminUser || adminUser.role !== UserRole.SuperAdmin) return null;
    return query(collection(firestore, 'issueReports'));
  }, [firestore, adminUser]);
  const { data: reports, isLoading: reportsLoading } = useCollection<Report>(reportsQuery);

  const uniqueCitizenIds = useMemo(() => {
      if (!reports) return [];
      const ids = reports.map(r => r.citizenId);
      return [...new Set(ids)];
  }, [reports]);

  const handleBan = (citizenId: string, duration: Duration | 'lifetime') => {
    if (!firestore) return;

    const bannedUntil = duration === 'lifetime' ? 'lifetime' : add(new Date(), duration).toISOString();
    
    const userDocRef = doc(firestore, 'users', citizenId);
    updateDocumentNonBlocking(userDocRef, { bannedUntil });

    toast({
      title: 'User Banned',
      description: `User has been banned.`,
    });
  };

  const handleUnban = (citizenId: string) => {
    if (!firestore) return;

    const userDocRef = doc(firestore, 'users', citizenId);
    updateDocumentNonBlocking(userDocRef, { bannedUntil: null });

     toast({
      title: 'User Unbanned',
      description: `User has been unbanned.`,
    });
  };

  const banDurations = [
    { label: '1 Week', duration: { weeks: 1 } },
    { label: '1 Month', duration: { months: 1 } },
    { label: '3 Months', duration: { months: 3 } },
    { label: '6 Months', duration: { months: 6 } },
    { label: '1 Year', duration: { years: 1 } },
    { label: '3 Years', duration: { years: 3 } },
    { label: '5 Years', duration: { years: 5 } },
    { label: 'Lifetime', duration: 'lifetime' as const },
  ];

  const isLoadingPage = isUserLoading || reportsLoading;

  if (isLoadingPage) {
    return <UserTableSkeleton />;
  }
  
  if (adminUser?.role !== UserRole.SuperAdmin) {
    return (
        <Card>
            <CardHeader><CardTitle>Permission Denied</CardTitle></CardHeader>
            <CardContent><p>You do not have permission to view this page.</p></CardContent>
        </Card>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight font-headline">User Management</h1>
      <Card>
        <CardHeader>
          <CardTitle>All Citizens</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rejected Reports</TableHead>
                  <TableHead>Date Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {uniqueCitizenIds.map((citizenId) => (
                  <CitizenProfile
                    key={citizenId}
                    citizenId={citizenId}
                    reports={reports || []}
                    onBan={handleBan}
                    onUnban={handleUnban}
                    banDurations={banDurations}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
