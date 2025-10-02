
'use client';

import { useState, useMemo } from 'react';
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
import { add, format, formatDistanceToNow } from 'date-fns';

function UserTableSkeleton() {
  return (
    <div className="space-y-4">
      {Array(5)
        .fill(0)
        .map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        ))}
    </div>
  );
}

export default function UsersPage() {
  const { user: adminUser, isLoading: isUserLoading, firestore } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isManageDialogOpen, setIsManageDialogOpen] = useState(false);

  const usersQuery = useMemoFirebase(() => {
    if (!firestore || adminUser?.role !== UserRole.SuperAdmin) return null;
    return query(collection(firestore, 'users'), where('role', '==', UserRole.Citizen));
  }, [firestore, adminUser]);

  const { data: users, isLoading: areUsersLoading } = useCollection<UserProfile>(usersQuery);

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
  };

  const isLoading = isUserLoading || areUsersLoading;

  if (!isUserLoading && adminUser?.role !== UserRole.SuperAdmin) {
    router.push('/admin');
    return null;
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
          {isLoading ? (
            <UserTableSkeleton />
          ) : (
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
                  {users?.map((user) => {
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
                  })}
                </TableBody>
              </Table>
            </div>
          )}
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
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-4">
                  <div className="text-sm">
                      <p><span className="font-semibold">Email:</span> {selectedUser.email}</p>
                      <p><span className="font-semibold">Phone:</span> {selectedUser.phone}</p>
                      <p><span className="font-semibold">Address:</span> {selectedUser.address}</p>
                      <p><span className="font-semibold">Joined:</span> {formatDistanceToNow(new Date(selectedUser.dateJoined), { addSuffix: true })}</p>
                  </div>
                  {selectedUser.bannedUntil && new Date(selectedUser.bannedUntil) > new Date() && (
                      <p className="text-sm text-destructive font-medium">
                          This user is banned until {format(new Date(selectedUser.bannedUntil), 'PPP')}.
                      </p>
                  )}
              </div>
              <DialogFooter className="sm:justify-start gap-2">
                <Button onClick={handleBanUser} variant="destructive">
                  <Ban className="mr-2 h-4 w-4" /> Ban for 60 Days
                </Button>
                <Button onClick={handleRemoveBan} variant="outline">
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
