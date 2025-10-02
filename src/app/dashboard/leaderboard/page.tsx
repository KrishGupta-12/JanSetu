'use client';
import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserProfile, Report, ReportStatus, UserRole } from '@/lib/types';
import { Trophy, Shield, Star, Award } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '@/hooks/useAuth';

type LeaderboardEntry = {
  citizen: UserProfile;
  score: number;
  totalReports: number;
  resolvedReports: number;
};

const getContributionLevel = (score: number) => {
    if (score >= 50) return { level: 'Platinum', color: 'text-blue-500', icon: <Award /> };
    if (score >= 25) return { level: 'Gold', color: 'text-yellow-500', icon: <Trophy /> };
    if (score >= 10) return { level: 'Silver', color: 'text-gray-400', icon: <Shield /> };
    if (score >= 1) return { level: 'Bronze', color: 'text-orange-700', icon: <Star /> };
    return { level: 'New', color: 'text-muted-foreground', icon: <Star /> };
};

function LeaderboardSkeleton() {
    return (
        <Card>
            <CardHeader>
                 <Skeleton className="h-8 w-48" />
                 <Skeleton className="h-4 w-64" />
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
                            {Array.from({ length: 5 }).map((_, i) => (
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


export default function LeaderboardPage() {
    const { firestore } = useAuth();

    const citizensQuery = useMemoFirebase(() => {
      if (!firestore) return null;
      return query(collection(firestore, 'users'), where('role', '==', 'citizen'));
    }, [firestore]);
    const { data: citizens, isLoading: citizensLoading } = useCollection<UserProfile>(citizensQuery);
    
    const reportsQuery = useMemoFirebase(() => {
      if (!firestore) return null;
      return query(collection(firestore, 'issueReports'));
    }, [firestore]);
    const { data: reports, isLoading: reportsLoading } = useCollection<Report>(reportsQuery);

    const leaderboardData = useMemo(() => {
        if (!citizens || !reports) return [];

        const citizenScores = citizens.map(citizen => {
            const userReports = reports.filter(r => r.citizenId === citizen.uid);
            const resolvedReports = userReports.filter(r => r.status === ReportStatus.Resolved).length;
            const score = resolvedReports * 5 + userReports.length;
            return {
                citizen,
                score,
                totalReports: userReports.length,
                resolvedReports
            };
        });

        return citizenScores.sort((a, b) => b.score - a.score);
    }, [citizens, reports]);

    const isLoading = citizensLoading || reportsLoading;

    if (isLoading) {
        return <LeaderboardSkeleton />;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-headline font-bold tracking-tight">Community Leaderboard</h1>
                <p className="text-muted-foreground">
                    Recognizing the most active and impactful citizens.
                </p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Top Contributors</CardTitle>
                    <CardDescription>Ranking is based on the number and impact of reports submitted.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Rank</TableHead>
                                    <TableHead>Citizen</TableHead>
                                    <TableHead>Contribution Score</TableHead>
                                    <TableHead>Level</TableHead>
                                    <TableHead className="text-right">Reports (Resolved/Total)</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {leaderboardData.map((entry, index) => {
                                    const { icon, color, level } = getContributionLevel(entry.score);
                                    return (
                                        <TableRow key={entry.citizen.uid} className={index < 3 ? 'bg-secondary' : ''}>
                                            <TableCell className="font-bold text-lg">{index + 1}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar>
                                                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${entry.citizen.name}`} />
                                                        <AvatarFallback>{entry.citizen.name.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <span className="font-medium">{entry.citizen.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-semibold text-xl">{entry.score}</TableCell>
                                            <TableCell>
                                                <div className={`flex items-center gap-2 font-semibold ${color}`}>
                                                    {icon}
                                                    <span>{level}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                {entry.resolvedReports} / {entry.totalReports}
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
