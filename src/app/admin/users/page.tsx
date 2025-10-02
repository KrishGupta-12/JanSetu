
'use client';

import { useState, useMemo, useEffect } from 'react';
import { UserProfile, UserRole, Report } from '@/lib/types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MoreHorizontal, Ban, RotateCcw, Search, UserX, ShieldX, Files, ListChecks, Hourglass } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, doc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

type EnrichedCitizen = UserProfile & {
  isBanned: boolean;
};

const UserStatsCard = ({ user, reports }: { user: UserProfile; reports: Report[] }) => {
    const userReports = reports.filter(r => r.citizenId === user.uid);
    const resolvedCount = userReports.filter(r => r.status === 'Resolved').length;
    const inProgressCount = userReports.filter(r => r.status === 'In Progress').length;
    const rejectedCount = userReports.filter(r => r.status === 'Rejected').length;

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
                    <Files className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent><div className="text-2xl font-bold">{userReports.length}</div></CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Resolved</CardTitle>
                    <ListChecks className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent><div className="text-2xl font-bold">{resolvedCount}</div></CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                    <Hourglass className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent><div className="text-2xl font-bold">{inProgressCount}</div></CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                    <ShieldX className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent><div className="text-2xl font-bold">{rejectedCount}</div></CardContent>
            </Card>
        </div>
    )
}

function UsersTableSkeleton() {
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
                                {Array.from({ length: 4 }).map((_, i) => <TableHead key={i}><Skeleton className="h-6 w-full" /></TableHead>)}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                    {Array.from({ length: 4 }).map((_, j) => <TableCell key={j}><Skeleton className="h-10 w-full" /></TableCell>)}
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
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<EnrichedCitizen | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const citizensQuery = useMemoFirebase(() => {
    if (!firestore || !adminUser || adminUser.role !== UserRole.SuperAdmin) return null;
    return query(collection(firestore, 'users'), where('role', '==', UserRole.Citizen));
  }, [firestore, adminUser]);
  const { data: citizens, isLoading: areCitizensLoading } = useCollection<UserProfile>(citizensQuery);

  const reportsQuery = useMemoFirebase(() => {
    if (!firestore || !adminUser || adminUser.role !== UserRole.SuperAdmin) return null;
    return query(collection(firestore, 'issueReports'));
  }, [firestore, adminUser]);
  const { data: allReports, isLoading: areReportsLoading } = useCollection<Report>(reportsQuery);

  useEffect(() => {
    if (!isUserLoading && adminUser?.role !== UserRole.SuperAdmin) {
      router.push('/admin');
    }
  }, [isUserLoading, adminUser, router]);


  const filteredUsers = useMemo(() => {
    if (!citizens) return [];
    const enriched = citizens.map(c => ({
        ...c,
        isBanned: !!c.bannedUntil && (c.bannedUntil === 'lifetime' || new Date(c.bannedUntil) > new Date())
    }));

    if (!searchQuery) return enriched;
    return enriched.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [citizens, searchQuery]);
  
  const handleViewDetails = (user: EnrichedCitizen) => {
      setSelectedUser(user);
      setIsDetailsOpen(true);
  }
  
  const isLoading = isUserLoading || areCitizensLoading || areReportsLoading;

  if (isLoading || !adminUser) {
     return (
       <div className="space-y-6">
         <Skeleton className="h-12 w-full" />
         <UsersTableSkeleton />
       </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">User Management</h1>
        <p className="text-muted-foreground">Manage all citizen accounts on the platform.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Citizens</CardTitle>
          <CardDescription>A list of all registered citizens. You can search and view details.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex w-full max-w-md items-center space-x-2 mb-4">
            <Input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
           <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reports (Resolved/Total)</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.uid}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} />
                           <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <span className="font-medium">{user.name}</span>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                     <TableCell>
                        {user.isBanned ? (
                           <Badge variant="destructive" className="items-center gap-1">
                                <Ban className="h-3 w-3" /> Banned
                            </Badge>
                        ) : (
                           <Badge variant="secondary" className="text-green-600 border-green-300">Active</Badge>
                        )}
                    </TableCell>
                    <TableCell>
                        <span className="font-medium">{user.resolvedReports} / {user.totalReports}</span>
                    </TableCell>
                    <TableCell className="text-right">
                       <Button variant="ghost" size="sm" onClick={() => handleViewDetails(user)}>
                            <Search className="mr-2 h-4 w-4"/>
                            View Details
                       </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
       <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
            {selectedUser && (
                <>
                    <DialogHeader>
                        <DialogTitle>User Details: {selectedUser.name}</DialogTitle>
                        <DialogDescription>{selectedUser.email}</DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-6">
                        <UserStatsCard user={selectedUser} reports={allReports || []} />

                        <Card>
                            <CardHeader>
                                <CardTitle>Rejected Reports</CardTitle>
                                <CardDescription>A list of reports submitted by this user that were marked as 'Rejected'.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Report ID</TableHead>
                                                <TableHead>Category</TableHead>
                                                <TableHead>Description</TableHead>
                                                <TableHead>Date Rejected</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {(allReports || []).filter(r => r.citizenId === selectedUser.uid && r.status === 'Rejected').map(report => (
                                                <TableRow key={report.id}>
                                                    <TableCell className="font-mono text-xs">{report.id.substring(0, 7)}</TableCell>
                                                    <TableCell>{report.category}</TableCell>
                                                    <TableCell className="max-w-sm truncate">{report.description}</TableCell>
                                                    <TableCell>{report.resolution?.date ? new Date(report.resolution.date).toLocaleDateString() : 'N/A'}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </>
            )}
        </DialogContent>
      </Dialog>

    </div>
  );
}
