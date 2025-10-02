'use client';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { UserProfile, AdminRole } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';


// Mock data for team members, in a real app this would come from a database
const mockTeam = [
    { id: 'team-001', name: 'Ramesh Kumar', role: 'Field Officer', reportsClosed: 32, avgRating: 4.5 },
    { id: 'team-002', name: 'Sunita Devi', role: 'Field Officer', reportsClosed: 41, avgRating: 4.8 },
    { id: 'team-003', name: 'Arjun Singh', role: 'Field Supervisor', reportsClosed: 15, avgRating: 4.2 },
    { id: 'team-004', name: 'Meena Kumari', role: 'Junior Officer', reportsClosed: 25, avgRating: 4.6 },
];

function TeamTableSkeleton() {
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
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {Array.from({ length: 4 }).map((_, i) => (
                                <TableRow key={i}>
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

export default function MyTeamPage() {
  const { user: adminData, isLoading: isUserLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && (!adminData || adminData.role === AdminRole.SuperAdmin)) {
      router.push('/admin'); 
    }
  }, [adminData, isUserLoading, router]);


  if (isUserLoading || !adminData) {
     return <TeamTableSkeleton />;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight font-headline">My Team</h1>
      <p className="text-muted-foreground">Manage and view the performance of your team members.</p>
      
      <Card>
        <CardHeader>
            <CardTitle>{adminData.department} Team Members</CardTitle>
        </CardHeader>
        <CardContent>
             <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Reports Resolved</TableHead>
                  <TableHead className="text-right">Avg. Citizen Rating</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockTeam.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${member.name}`} />
                           <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{member.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{member.role}</TableCell>
                    <TableCell>
                        <div className="font-medium">{member.reportsClosed}</div>
                    </TableCell>
                    <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                            <span className="font-semibold">{(member.avgRating).toFixed(1)}</span>
                            <Progress value={member.avgRating * 20} className="w-24 h-2" />
                        </div>
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
