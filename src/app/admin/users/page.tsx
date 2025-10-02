'use client';

import { useState } from 'react';
import { UserProfile, UserRole } from '@/lib/types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
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
import { Input } from '@/components/ui/input';
import { MoreHorizontal, Ban, RotateCcw, Search, UserX } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { add } from 'date-fns';
import { collection, query, where, getDocs, doc } from 'firebase/firestore';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useRouter } from 'next/navigation';

type EnrichedCitizen = UserProfile & {
  isBanned: boolean;
};

export default function UsersPage() {
  const { user: adminUser, isLoading: isUserLoading, firestore } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [searchEmail, setSearchEmail] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [foundUser, setFoundUser] = useState<EnrichedCitizen | null>(null);
  const [searchAttempted, setSearchAttempted] = useState(false);

  // Redirect if not a super admin
  if (!isUserLoading && adminUser?.role !== UserRole.SuperAdmin) {
    router.push('/admin');
  }

  const handleSearch = async () => {
    if (!firestore || !searchEmail) {
      toast({
        variant: 'destructive',
        title: 'Invalid Search',
        description: 'Please enter an email to search for.',
      });
      return;
    }

    setIsSearching(true);
    setSearchAttempted(true);
    setFoundUser(null);

    try {
      const usersRef = collection(firestore, 'users');
      const q = query(usersRef, where('email', '==', searchEmail.trim()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setFoundUser(null);
        toast({
          variant: 'destructive',
          title: 'Not Found',
          description: `No user found with the email: ${searchEmail}`,
        });
      } else {
        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data() as UserProfile;
        const isBanned = !!userData.bannedUntil && (userData.bannedUntil === 'lifetime' || new Date(userData.bannedUntil) > new Date());
        setFoundUser({ ...userData, isBanned });
      }
    } catch (error) {
      console.error('Error searching user:', error);
      toast({
        variant: 'destructive',
        title: 'Search Error',
        description: 'An error occurred while searching for the user.',
      });
    } finally {
      setIsSearching(false);
    }
  };
  
  const handleBan = (citizenId: string, duration: Duration | 'lifetime') => {
    if (!firestore) return;

    const bannedUntil = duration === 'lifetime' ? 'lifetime' : add(new Date(), duration).toISOString();
    
    const userDocRef = doc(firestore, 'users', citizenId);
    updateDocumentNonBlocking(userDocRef, { bannedUntil });

    if (foundUser) {
        setFoundUser({ ...foundUser, isBanned: true, bannedUntil });
    }

    toast({
      title: 'User Banned',
      description: `User has been banned.`,
    });
  };

  const handleUnban = (citizenId: string) => {
    if (!firestore) return;

    const userDocRef = doc(firestore, 'users', citizenId);
    updateDocumentNonBlocking(userDocRef, { bannedUntil: null });

    if (foundUser) {
        setFoundUser({ ...foundUser, isBanned: false, bannedUntil: null });
    }

     toast({
      title: 'User Unbanned',
      description: `User has been unbanned.`,
    });
  };


  const banDurations = [
    { label: '1 Week', duration: { weeks: 1 } },
    { label: '1 Month', duration: { months: 1 } },
    { label: '6 Months', duration: { months: 6 } },
    { label: '1 Year', duration: { years: 1 } },
    { label: 'Lifetime', duration: 'lifetime' as const },
  ];
  
  if (isUserLoading || !adminUser) {
     return (
       <div className="space-y-6">
         <Skeleton className="h-12 w-full" />
         <Skeleton className="h-64 w-full" />
       </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">User Management</h1>
        <p className="text-muted-foreground">Search for a user by email to manage their account.</p>
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
              disabled={isSearching}
            />
            <Button onClick={handleSearch} disabled={isSearching}>
              {isSearching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
              Search
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {isSearching && (
          <Card>
              <CardContent className="pt-6">
                 <div className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                    </div>
                </div>
              </CardContent>
          </Card>
      )}

      {foundUser && (
        <Card>
          <CardHeader>
            <CardTitle>User Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${foundUser.name}`} />
                        <AvatarFallback>{foundUser.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="text-xl font-bold flex items-center gap-2">
                            {foundUser.name}
                            {foundUser.isBanned && (
                                <Badge variant="destructive" className="items-center gap-1">
                                    <Ban className="h-3 w-3" /> Banned
                                </Badge>
                            )}
                        </p>
                        <p className="text-muted-foreground">{foundUser.email}</p>
                    </div>
                </div>
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
                        {foundUser.isBanned ? (
                            <DropdownMenuItem onClick={() => handleUnban(foundUser.uid)}>
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
                                        <DropdownMenuItem key={d.label} onClick={() => handleBan(foundUser.uid, d.duration)}>
                                            {d.label}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuSubContent>
                            </DropdownMenuSub>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
          </CardContent>
        </Card>
      )}
      
      {!foundUser && searchAttempted && !isSearching && (
           <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                <UserX className="h-12 w-12 mx-auto mb-4" />
                <h3 className="text-lg font-semibold">No User Found</h3>
                <p>The user with email "{searchEmail}" could not be found. Please check the email and try again.</p>
              </CardContent>
            </Card>
      )}

    </div>
  );
}
