
'use client';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { UserProfile, AdminRole, Report, ReportStatus, DepartmentAdminRoles } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';

const isDepartmentAdmin = (role: AdminRole) => DepartmentAdminRoles.includes(role);

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
  const { user: adminData, isLoading: isUserLoading, firestore } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && (!adminData || !adminData.role || !isDepartmentAdmin(adminData.role))) {
      router.push('/admin'); 
    }
  }, [adminData, isUserLoading, router]);

  const teamQuery = useMemoFirebase(() => {
    if (!firestore || !adminData || !adminData.department) return null;
    return query(collection(firestore, 'users'), where('department', '==', adminData.department));
  }, [adminData, firestore]);

  const { data: teamMembers, isLoading: teamLoading } = useCollection<UserProfile>(teamQuery);

  const reportsQuery = useMemoFirebase(() => {
    if (!firestore || !adminData || !adminData.department) return null;
    return query(collection(firestore, 'issueReports'), where('category', '==', adminData.department));
  }, [adminData, firestore]);
  
  const { data: reports, isLoading: reportsLoading } = useCollection<Report>(reportsQuery);

  const teamPerformance = useMemo(() => {
    if (!teamMembers || !reports) return [];
    return teamMembers.map(member => {
      const memberReports = reports.filter(r => r.assignedAdminId === member.uid);
      const resolvedReports = memberReports.filter(r => r.status === ReportStatus.Resolved && r.resolution);
      const totalRating = resolvedReports.reduce((acc, r) => acc + (r.resolution?.citizenRating || 0), 0);
      const avgRating = resolvedReports.length > 0 ? totalRating / resolvedReports.length : 0;
      return {
        ...member,
        reportsResolved: resolvedReports.length,
        avgRating,
      }
    });
  }, [teamMembers, reports]);

  if (isUserLoading || teamLoading || reportsLoading || !adminData) {
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
                  <TableHead>Email</TableHead>
                  <TableHead>Reports Resolved</TableHead>
                  <TableHead className="text-right">Avg. Citizen Rating</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teamPerformance.map((member) => (
                  <TableRow key={member.uid}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${member.name}`} />
                           <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{member.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>
                        <div className="font-medium">{member.reportsResolved}</div>
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
