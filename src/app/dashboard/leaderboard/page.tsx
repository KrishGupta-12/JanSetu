
'use client';
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserProfile } from '@/lib/types';
import { Trophy, Shield, Star, Award } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/lib/types';

const getContributionLevel = (score: number) => {
    if (score >= 50) return { level: 'Platinum', color: 'text-blue-500', icon: <Award /> };
    if (score >= 25) return { level: 'Gold', color: 'text-yellow-500', icon: <Trophy /> };
    if (score >= 10) return { level: 'Silver', color: 'text-gray-400', icon: <Shield /> };
    if (score >= 1) return { level: 'Bronze', color: 'text-orange-700', icon: <Star /> };
    return { level: 'New', color: 'text-muted-foreground', icon: <Star /> };
};

function LeaderboardSkeleton() {
    return (
        <div className="space-y-6">
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
        </div>
    )
}

export default function LeaderboardPage() {
    const { user, firestore } = useAuth();

    const usersQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'users'), where('role', '==', UserRole.Citizen));
    }, [firestore]);

    const { data: users, isLoading } = useCollection<UserProfile>(usersQuery);
    
    const leaderboardData = useMemo(() => {
        if (!users) return [];
        
        return users.map(u => ({
            ...u,
            // Calculate score based on the fields from the user document
            score: ((u.resolvedReports || 0) * 5) + (u.totalReports || 0),
        })).sort((a, b) => b.score - a.score);

    }, [users]);

    const userRank = useMemo(() => {
        if (!leaderboardData || !user) return null;
        const rank = leaderboardData.findIndex(entry => entry.uid === user.uid);
        return rank !== -1 ? rank + 1 : null;
    }, [leaderboardData, user]);

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
            
            {user && user.role === UserRole.Citizen && (
                <Card>
                    <CardHeader>
                        <CardTitle>My Rank</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {userRank !== null ? (
                             <p className="text-lg">You are ranked <span className="font-bold text-primary">#{userRank}</span> on the leaderboard. Keep up the great work!</p>
                        ) : (
                            <p className="text-muted-foreground">Your rank isn't in the top contributors yet. Submit a report to get on the board!</p>
                        )}
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Top Contributors</CardTitle>
                    <CardDescription>Ranking is based on the number and impact of reports submitted. Updated in real-time.</CardDescription>
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
                                {leaderboardData && leaderboardData.length > 0 ? (
                                    leaderboardData.map((entry, index) => {
                                        const { icon, color, level } = getContributionLevel(entry.score);
                                        return (
                                            <TableRow key={entry.uid} className={index < 3 ? 'bg-secondary' : ''}>
                                                <TableCell className="font-bold text-lg">{index + 1}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <Avatar>
                                                            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${entry.name}`} />
                                                            <AvatarFallback>{entry.name.charAt(0)}</AvatarFallback>
                                                        </Avatar>
                                                        <span className="font-medium">{entry.name}</span>
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
                                                    {entry.resolvedReports || 0} / {entry.totalReports || 0}
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                            The leaderboard is currently empty. Be the first to contribute!
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
