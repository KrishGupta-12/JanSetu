
'use client';

import { useState, useMemo } from 'react';
import { UserProfile, UserRole } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Ban, Search, UserCheck, UserX } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { collection, query, where, getDocs, doc } from 'firebase/firestore';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { add, formatDistanceToNow } from 'date-fns';

export default function UsersPage() {
  const { user: adminUser, isLoading: isUserLoading, firestore } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [searchEmail, setSearchEmail] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [foundUser, setFoundUser] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isBanned = useMemo(() => {
    if (!foundUser || !foundUser.bannedUntil) return false;
    if (foundUser.bannedUntil === 'lifetime') return true;
    return new Date(foundUser.bannedUntil) > new Date();
  }, [foundUser]);

  const handleSearch = async () => {
    if (!firestore || !searchEmail) return;
    setIsSearching(true);
    setFoundUser(null);
    setError(null);

    try {
      const usersRef = collection(firestore, 'users');
      const q = query(usersRef, where('email', '==', searchEmail.trim()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError('No user found with that email address.');
      } else {
        const userDoc = querySnapshot.docs[0];
        setFoundUser({ ...userDoc.data(), uid: userDoc.id } as UserProfile);
      }
    } catch (e: any) {
      setError('An error occurred while searching for the user.');
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  };
  
  const handleBanUser = () => {
    if (!firestore || !foundUser) return;
    const banExpiry = add(new Date(), { days: 60 });
    const userRef = doc(firestore, 'users', foundUser.uid);
    
    updateDocumentNonBlocking(userRef, { bannedUntil: banExpiry.toISOString() });

    setFoundUser(prev => prev ? { ...prev, bannedUntil: banExpiry.toISOString() } : null);

    toast({
        title: 'User Banned',
        description: `${foundUser.name} has been banned for 60 days.`,
    });
  }
  
  const handleRemoveBan = () => {
     if (!firestore || !foundUser) return;
     const userRef = doc(firestore, 'users', foundUser.uid);
     
     updateDocumentNonBlocking(userRef, { bannedUntil: null });

     setFoundUser(prev => prev ? { ...prev, bannedUntil: null } : null);

     toast({
        title: 'Ban Removed',
        description: `The ban has been lifted for ${foundUser.name}.`,
    });
  }


  if (isUserLoading) {
    return <Skeleton className="h-96 w-full" />;
  }

  if (adminUser?.role !== UserRole.SuperAdmin) {
    router.push('/admin');
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">User Management</h1>
        <p className="text-muted-foreground">Look up a user by their email to manage their account.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search User</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex w-full max-w-md items-center space-x-2">
            <Input
              type="email"
              placeholder="user@example.com"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={isSearching}>
              {isSearching ? 'Searching...' : <Search className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      {isSearching && <Skeleton className="h-64 w-full" />}
      
      {error && <p className="text-destructive">{error}</p>}

      {foundUser && (
        <Card>
          <CardHeader>
            <CardTitle>User Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${foundUser.name}`} />
                <AvatarFallback>{foundUser.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-xl font-bold">{foundUser.name}</p>
                <p className="text-muted-foreground">{foundUser.email}</p>
              </div>
               {isBanned ? (
                   <Badge variant="destructive" className="items-center gap-1 ml-auto">
                        <UserX className="h-3 w-3" /> Banned
                    </Badge>
                ) : (
                   <Badge variant="secondary" className="text-green-600 border-green-300 ml-auto">Active</Badge>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="font-semibold">Address:</span> {foundUser.address}</div>
                <div><span className="font-semibold">Phone:</span> {foundUser.phone}</div>
                <div><span className="font-semibold">Total Reports:</span> {foundUser.totalReports}</div>
                <div><span className="font-semibold">Resolved Reports:</span> {foundUser.resolvedReports}</div>
                <div><span className="font-semibold">Joined:</span> {formatDistanceToNow(new Date(foundUser.dateJoined), { addSuffix: true })}</div>
                {isBanned && <div><span className="font-semibold">Ban Lifts:</span> {foundUser.bannedUntil === 'lifetime' ? 'Lifetime' : formatDistanceToNow(new Date(foundUser.bannedUntil!), { addSuffix: true })}</div>}
            </div>

             <div className="border-t pt-6">
                <h3 className="font-semibold mb-4">Admin Actions</h3>
                <div className="flex gap-4">
                    <Button onClick={handleBanUser} disabled={isBanned}>
                       <Ban className="mr-2 h-4 w-4" /> Ban for 60 Days
                    </Button>
                    <Button onClick={handleRemoveBan} disabled={!isBanned} variant="outline">
                        <UserCheck className="mr-2 h-4 w-4" /> Remove Ban
                    </Button>
                </div>
             </div>

          </CardContent>
        </Card>
      )}
    </div>
  );
}

    