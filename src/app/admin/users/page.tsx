
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
import { useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, doc, orderBy } from 'firebase/firestore';
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


export default function UsersPage() {
  const { user: adminUser, isLoading: isUserLoading, firestore } = useAuth();
  const { toast } = useToast();

  const usersQuery = useMemoFirebase(() => {
    if (!firestore || !adminUser || adminUser.role !== UserRole.SuperAdmin) return null;
    return query(collection(firestore, 'users'), where('role', '==', 'citizen'), orderBy('dateJoined', 'desc'));
  }, [firestore, adminUser]);
  const { data: citizens, isLoading: citizensLoading } = useCollection<UserProfile>(usersQuery);

  const reportsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'issueReports'));
  }, [firestore]);
  const { data: reports, isLoading: reportsLoading } = useCollection<Report>(reportsQuery);

  const citizenData: EnrichedCitizen[] = useMemo(() => {
    if (!citizens || !reports) return [];
    return citizens.map(citizen => {
      const rejectedReports = reports.filter(report => report.citizenId === citizen.uid && report.status === ReportStatus.Rejected).length;
      const isFlagged = rejectedReports >= 5;
      const isBanned = !!citizen.bannedUntil && (citizen.bannedUntil === 'lifetime' || new Date(citizen.bannedUntil) > new Date());
      
      return {
        ...citizen,
        rejectedReports,
        isFlagged,
        isBanned
      }
    });
  }, [citizens, reports]);

  const handleBan = (citizenId: string, duration: Duration | 'lifetime') => {
    const citizen = citizens?.find(c => c.uid === citizenId);
    if (!citizen || !firestore) return;

    const bannedUntil = duration === 'lifetime' ? 'lifetime' : add(new Date(), duration).toISOString();
    
    const userDocRef = doc(firestore, 'users', citizenId);
    updateDocumentNonBlocking(userDocRef, { bannedUntil });

    toast({
      title: 'User Banned',
      description: `${citizen.name} has been banned.`,
    });
  };

  const handleUnban = (citizenId: string) => {
     const citizen = citizens?.find(c => c.uid === citizenId);
    if (!citizen || !firestore) return;

    const userDocRef = doc(firestore, 'users', citizenId);
    updateDocumentNonBlocking(userDocRef, { bannedUntil: null });

     toast({
      title: 'User Unbanned',
      description: `${citizen.name} has been unbanned.`,
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
    { label: 'Lifetime', duration: 'lifetime' },
  ];

  const isLoadingPage = isUserLoading || citizensLoading || reportsLoading;

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
                {citizenData.map((citizen) => (
                  <TableRow key={citizen.uid} className={citizen.isFlagged && !citizen.isBanned ? 'bg-red-50 dark:bg-red-900/20' : ''}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${citizen.name}`} />
                           <AvatarFallback>{citizen.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex items-center gap-2">
                           <span className="font-medium">{citizen.name}</span>
                           {citizen.isFlagged && (
                             <Badge variant="destructive" className="items-center gap-1">
                               <ShieldAlert className="h-3 w-3" /> Flagged
                             </Badge>
                           )}
                           {citizen.isBanned && (
                              <Badge variant="destructive" className="items-center gap-1">
                                <Ban className="h-3 w-3" /> Banned
                              </Badge>
                           )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{citizen.email}</TableCell>
                    <TableCell>
                        <div className="font-medium text-center">{citizen.rejectedReports}</div>
                    </TableCell>
                    <TableCell>
                      {new Date(citizen.dateJoined).toLocaleDateString()}
                      {citizen.isBanned && (
                        <p className="text-xs text-destructive">
                          {citizen.bannedUntil === 'lifetime' ? 'Banned for life' : `Banned until ${new Date(citizen.bannedUntil!).toLocaleDateString()}`}
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                       {adminUser?.role === UserRole.SuperAdmin && (
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
                              {citizen.isBanned ? (
                                <DropdownMenuItem onClick={() => handleUnban(citizen.uid)}>
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
                                      <DropdownMenuItem key={d.label} onClick={() => handleBan(citizen.uid, d.duration as any)}>
                                        {d.label}
                                      </DropdownMenuItem>
                                    ))}
                                  </DropdownMenuSubContent>
                                </DropdownMenuSub>
                              )}
                           </DropdownMenuContent>
                         </DropdownMenu>
                       )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
