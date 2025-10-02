'use client';

import { Citizen, Report, ReportStatus } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { mockCitizens, mockReports } from '@/lib/data';
import { useState, useEffect, useMemo } from 'react';
import { ShieldAlert } from 'lucide-react';

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
  const [citizens, setCitizens] = useState<Citizen[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching data
    setTimeout(() => {
        setCitizens(mockCitizens);
        setReports(mockReports);
        setIsLoading(false);
    }, 1000)
  }, []);

  const citizenData = useMemo(() => {
    return citizens.map(citizen => {
      const rejectedReports = reports.filter(report => report.citizenId === citizen.id && report.status === ReportStatus.Rejected).length;
      const isFlagged = rejectedReports >= 5;
      return {
        ...citizen,
        rejectedReports,
        isFlagged
      }
    });
  }, [citizens, reports]);

  if (isLoading) {
    return <UserTableSkeleton />;
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {citizenData.map((citizen) => (
                  <TableRow key={citizen.id} className={citizen.isFlagged ? 'bg-red-50 dark:bg-red-900/20' : ''}>
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
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{citizen.email}</TableCell>
                    <TableCell>
                        <div className="font-medium text-center">{citizen.rejectedReports}</div>
                    </TableCell>
                    <TableCell>{new Date(citizen.dateJoined).toLocaleDateString()}</TableCell>
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
