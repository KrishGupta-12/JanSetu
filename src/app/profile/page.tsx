
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
import { Loader2, Files, ListChecks, Hourglass, ShieldX, Award, Star } from 'lucide-react';
import { Report, ReportStatus } from '@/lib/types';
import { Textarea } from '@/components/ui/textarea';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';


const ContributionCard = ({ title, value, icon }: { title: string; value: string | number; icon: React.ReactNode }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
);

const getContributionLevel = (score: number) => {
    if (score >= 50) return { level: 'Platinum Contributor', color: 'bg-blue-500', icon: <Award className="text-white"/> };
    if (score >= 25) return { level: 'Gold Contributor', color: 'bg-yellow-500', icon: <Award className="text-white"/> };
    if (score >= 10) return { level: 'Silver Contributor', color: 'bg-gray-400', icon: <Star className="text-white"/> };
    if (score >= 1) return { level: 'Bronze Contributor', color: 'bg-orange-700', icon: <Star className="text-white"/> };
    return { level: 'New Contributor', color: 'bg-gray-500', icon: <Star className="text-white"/> };
}


export default function ProfilePage() {
  const { user, isLoading: isUserLoading, updateUser } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const firestore = useFirestore();
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');

  const [isSaving, setIsSaving] = useState(false);

  const userReportsQuery = useMemoFirebase(
    () => user ? query(collection(firestore, 'issueReports'), where('citizenId', '==', user.uid)) : null,
    [user, firestore]
  );
  const { data: userReports, isLoading: isReportsLoading } = useCollection<Report>(userReportsQuery);

  const userStats = useMemo(() => {
    if (!userReports) return { total: 0, resolved: 0, inProgress: 0, rejected: 0, score: 0 };
    const resolved = userReports.filter(r => r.status === ReportStatus.Resolved).length;
    const score = resolved * 5 + userReports.length;
    return {
        total: userReports.length,
        resolved,
        inProgress: userReports.filter(r => r.status === ReportStatus.InProgress).length,
        rejected: userReports.filter(r => r.status === ReportStatus.Rejected).length,
        score,
    }
  }, [userReports]);
  
  const contribution = getContributionLevel(userStats.score);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  useEffect(() => {
      if(user) {
          setName(user.name || '');
          setPhone(user.phone || '');
          setDob(user.dob || '');
          setAddress(user.address || '');
          setCity(user.city || 'Chandigarh');
          setState(user.state || 'Chandigarh');
      }
  }, [user]);

  const handleSave = async () => {
      if (!user) return;
      setIsSaving(true);
      
      const updatedData = { name, phone, dob, address, city, state };
      updateUser(updatedData);

      toast({ title: 'Success', description: 'Profile updated successfully.' });
      setIsSaving(false);
  }

  const isLoading = isUserLoading || isReportsLoading;

  if (isLoading || !user) {
     return (
       <div className="container mx-auto max-w-4xl py-8 px-4">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-96 w-full" />
            </div>
            <div className="md:col-span-1">
                <Skeleton className="h-64 w-full" />
            </div>
         </div>
       </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
                 <Card>
                    <CardHeader>
                        <CardTitle className="text-3xl font-headline">My Profile</CardTitle>
                        <CardDescription>
                            Welcome, {user.name}!
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4 p-4 rounded-lg bg-secondary">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${contribution.color}`}>
                                {contribution.icon}
                            </div>
                            <div>
                                <p className="font-bold text-lg">{contribution.level}</p>
                                <p className="text-sm text-muted-foreground">Contribution Score: {userStats.score}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle>My Contributions</CardTitle>
                        <CardDescription>An overview of your reporting activity.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <ContributionCard title="Total Reports" value={userStats.total} icon={<Files className="h-4 w-4 text-muted-foreground" />} />
                        <ContributionCard title="Resolved" value={userStats.resolved} icon={<ListChecks className="h-4 w-4 text-muted-foreground" />} />
                        <ContributionCard title="In Progress" value={userStats.inProgress} icon={<Hourglass className="h-4 w-4 text-muted-foreground" />} />
                        <ContributionCard title="Rejected" value={userStats.rejected} icon={<ShieldX className="h-4 w-4 text-muted-foreground" />} />
                    </CardContent>
                </Card>
            </div>
            
            {/* Sidebar with Profile Form */}
            <div className="lg:col-span-1">
                 <Card>
                    <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                         <CardDescription>Keep your details up to date.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" value={user.email} disabled />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Your phone number" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="dob">Date of Birth</Label>
                            <Input id="dob" type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
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
        </div>
    </div>
  );
}
