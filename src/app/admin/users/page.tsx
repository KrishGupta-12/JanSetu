
'use client';

import { useState, useMemo, useEffect } from 'react';
import { UserProfile, UserRole } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Ban, UserCheck, UserX, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, doc } from 'firebase/firestore';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { add, format } from 'date-fns';

function UserTableSkeleton() {
  return (
    <div className="rounded-md border">
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead><Skeleton className="h-6 w-full" /></TableHead>
                    <TableHead><Skeleton className="h-6 w-full" /></TableHead>
                    <TableHead><Skeleton className="h-6 w-full" /></TableHead>
                    <TableHead className="text-right"><Skeleton className="h-6 w-full" /></TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><div className="flex items-center gap-3"><Skeleton className="h-10 w-10 rounded-full" /><div className="space-y-2"><Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-40" /></div></div></TableCell>
                        <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </div>
  );
}

export default function UsersPage() {
  const { user: adminUser, isLoading: isUserLoading, firestore } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isManageDialogOpen, setIsManageDialogOpen] = useState(false);

  // Effect to protect the route for super admins only
  useEffect(() => {
    if (!isUserLoading && (!adminUser || adminUser.role !== UserRole.SuperAdmin)) {
      router.push('/admin');
    }
  }, [isUserLoading, adminUser, router]);
  
  const usersQuery = useMemoFirebase(() => {
    if (!firestore || !adminUser || adminUser.role !== UserRole.SuperAdmin) return null;
    return query(collection(firestore, 'users'), where('role', '==', UserRole.Citizen));
  }, [firestore, adminUser]);

  const { data: users, isLoading: areUsersLoading, error } = useCollection<UserProfile>(usersQuery);

  if (error) {
    console.error("Firestore error fetching users:", error);
  }

  const handleOpenManageDialog = (user: UserProfile) => {
    setSelectedUser(user);
    setIsManageDialogOpen(true);
  };

  const handleBanUser = () => {
    if (!firestore || !selectedUser) return;
    const banExpiry = add(new Date(), { days: 60 });
    const userRef = doc(firestore, 'users', selectedUser.uid);

    updateDocumentNonBlocking(userRef, { bannedUntil: banExpiry.toISOString() });
    
    toast({
      title: 'User Banned',
      description: `${selectedUser.name} has been banned for 60 days.`,
    });
    setIsManageDialogOpen(false);
    setSelectedUser(null);
  };

  const handleRemoveBan = () => {
    if (!firestore || !selectedUser) return;
    const userRef = doc(firestore, 'users', selectedUser.uid);

    updateDocumentNonBlocking(userRef, { bannedUntil: null });

    toast({
      title: 'Ban Removed',
      description: `The ban has been lifted for ${selectedUser.name}.`,
    });
    setIsManageDialogOpen(false);
    setSelectedUser(null);
  };

  const isLoading = isUserLoading || areUsersLoading;

  if (isLoading || !adminUser || adminUser.role !== UserRole.SuperAdmin) {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">User Management</h1>
                <p className="text-muted-foreground">View and manage citizen accounts.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Citizen Users</CardTitle>
                    <CardDescription>A list of all registered citizens on the platform.</CardDescription>
                </CardHeader>
                <CardContent>
                    <UserTableSkeleton />
                </CardContent>
            </Card>
        </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">User Management</h1>
        <p className="text-muted-foreground">View and manage citizen accounts.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Citizen Users</CardTitle>
          <CardDescription>A list of all registered citizens on the platform.</CardDescription>
        </CardHeader>
        <CardContent>
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
                  {users && users.length > 0 ? (
                    users.map((user) => {
                      const isBanned = user.bannedUntil && new Date(user.bannedUntil) > new Date();
                      return (
                        <TableRow key={user.uid}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} />
                                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{user.name}</p>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {isBanned ? (
                              <Badge variant="destructive" className="items-center gap-1">
                                <UserX className="h-3 w-3" /> Banned
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-green-600 border-green-300">
                                Active
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {user.resolvedReports} / {user.totalReports}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" onClick={() => handleOpenManageDialog(user)}>
                              <Settings className="mr-2 h-4 w-4" /> Manage
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground h-24">
                        {areUsersLoading ? 'Loading users...' : (error ? `Error loading users. Check security rules.` : 'No citizen users found.')}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
        </CardContent>
      </Card>

      <Dialog open={isManageDialogOpen} onOpenChange={setIsManageDialogOpen}>
        <DialogContent>
          {selectedUser && (
            <>
              <DialogHeader>
                <DialogTitle>Manage {selectedUser.name}</DialogTitle>
                <DialogDescription>
                  Review user details and apply account actions.
                  {selectedUser.bannedUntil && new Date(selectedUser.bannedUntil) > new Date() && (
                      <p className="text-sm text-destructive font-medium pt-2">
                          This user is banned until {format(new Date(selectedUser.bannedUntil), 'PPP')}.
                      </p>
                  )}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="sm:justify-start gap-2 pt-4">
                <Button onClick={handleBanUser} variant="destructive">
                  <Ban className="mr-2 h-4 w-4" /> Ban for 60 Days
                </Button>
                <Button onClick={handleRemoveBan} variant="outline" disabled={!selectedUser.bannedUntil || new Date(selectedUser.bannedUntil) < new Date()}>
                  <UserCheck className="mr-2 h-4 w-4" /> Remove Ban
                </Button>
                 <DialogClose asChild>
                    <Button type="button" variant="secondary">
                        Close
                    </Button>
                </DialogClose>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
