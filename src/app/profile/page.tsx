'use client';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Citizen } from '@/lib/types';
import { Textarea } from '@/components/ui/textarea';
import { mockCitizens } from '@/lib/data';

export default function ProfilePage() {
  const { user, isLoading: isUserLoading, updateUser } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');

  const [isSaving, setIsSaving] = useState(false);

  const userProfile = useMemo(() => {
    if (!user) return null;
    // In a real app, you'd fetch this. Here we find it in mock data.
    return mockCitizens.find(c => c.id === user.id) || user;
  }, [user]);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  useEffect(() => {
      if(userProfile) {
          setName(userProfile.name || '');
          setPhone(userProfile.phone || '');
          setAddress(userProfile.address || '');
          setCity(userProfile.city || '');
          setState(userProfile.state || '');
      }
  }, [userProfile]);

  const handleSave = async () => {
      if (!user) return;
      setIsSaving(true);
      
      // Simulate API call
      setTimeout(() => {
        const updatedUser = { ...user, name, phone, address, city, state };
        updateUser(updatedUser); // Update context
        // In a real app, you would also update your backend.
        // For mock data, we could update the array, but that's complex without a state management library.
        toast({ title: 'Success', description: 'Profile updated successfully.' });
        setIsSaving(false);
      }, 1000);
  }

  const isLoading = isUserLoading;

  if (isLoading || !userProfile) {
     return (
       <div className="container mx-auto max-w-2xl py-8 px-4">
         <Card>
            <CardHeader>
                 <Skeleton className="h-8 w-1/3" />
                 <Skeleton className="h-4 w-2/3" />
            </CardHeader>
            <CardContent className="space-y-6">
                 <div className="space-y-2">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-10 w-full" />
                </div>
                 <div className="space-y-2">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-24 w-full" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                     <div className="space-y-2">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                </div>
                <Skeleton className="h-10 w-32" />
            </CardContent>
         </Card>
       </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-headline">My Profile</CardTitle>
          <CardDescription>
            Update your personal information. Your unique JanSetu ID is <strong>{userProfile.janId}</strong>.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
             <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={userProfile.email} disabled />
            </div>
             <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Your phone number" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
                <Input id="dob" value={userProfile.dob || ''} disabled />
            </div>
             <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Your full address" />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Your city" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input id="state" value={state} onChange={(e) => setState(e.target.value)} placeholder="Your state" />
                </div>
            </div>
            <Button onClick={handleSave} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                Save Changes
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}
