'use client'
import { Report, ReportCategory, ReportStatus, UserRole, UserProfile, DepartmentAdminRoles } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LineChart, Line } from 'recharts';
import { useMemo } from 'react';
import { subDays } from 'date-fns';
import { useCollection, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import { useAuth } from '@/hooks/useAuth';

const statusColors: {[key in ReportStatus]: string} = {
    [ReportStatus.Pending]: 'hsl(var(--chart-1))',
    [ReportStatus.InProgress]: 'hsl(var(--chart-2))',
    [ReportStatus.Resolved]: 'hsl(var(--chart-3))',
    [ReportStatus.Rejected]: 'hsl(var(--chart-4))',
    [ReportStatus.PendingCitizenFeedback]: 'hsl(var(--chart-5))',
    [ReportStatus.PendingApproval]: 'hsl(var(--chart-1))'
}

const categoryColors: {[key in ReportCategory]: string} = {
    [ReportCategory.Waste]: 'hsl(var(--chart-1))',
    [ReportCategory.Pothole]: 'hsl(var(--chart-2))',
    [ReportCategory.Streetlight]: 'hsl(var(--chart-3))',
    [ReportCategory.Water]: 'hsl(var(--chart-4))',
    [ReportCategory.Other]: 'hsl(var(--chart-5))',
}


export default function AnalyticsPage() {
    const { user: adminUser, firestore } = useAuth();

    const reportsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'issueReports'));
    }, [firestore]);
    const { data: reports, isLoading: reportsLoading } = useCollection<Report>(reportsQuery);

    const reportsByStatus = useMemo(() => {
        if (!reports) return [];
        const counts = Object.values(ReportStatus).reduce((acc, status) => {
            acc[status] = 0;
            return acc;
        }, {} as Record<ReportStatus, number>);

        reports.forEach(report => {
            counts[report.status]++;
        });

        return Object.entries(counts).map(([name, value]) => ({ name, value }));

    }, [reports]);

     const reportsByCategory = useMemo(() => {
        if (!reports) return [];
        const counts = Object.values(ReportCategory).reduce((acc, category) => {
            acc[category] = 0;
            return acc;
        }, {} as Record<ReportCategory, number>);

        reports.forEach(report => {
            counts[report.category]++;
        });
        
        return Object.entries(counts).map(([name, value]) => ({ name, value }));

    }, [reports]);

    const reportsOverTime = useMemo(() => {
        if (!reports) return [];
        const last30Days = Array.from({ length: 30 }, (_, i) => subDays(new Date(), i)).reverse();
        const data = last30Days.map(date => {
            const dateString = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            const count = reports.filter(r => new Date(r.reportDate).toDateString() === date.toDateString()).length;
            return { date: dateString, count };
        });
        return data;
    }, [reports]);

    if (reportsLoading) {
        return <div>Loading analytics...</div>
    }


    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight font-headline">Platform Analytics</h1>
             <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle>Reports by Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie data={reportsByStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                    {reportsByStatus.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={statusColors[entry.name as ReportStatus]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                 <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Reports by Category</CardTitle>
                    </CardHeader>
                    <CardContent>
                         <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={reportsByCategory}>
                                <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} angle={-45} textAnchor="end" height={60} />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="value" name="Count">
                                     {reportsByCategory.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={categoryColors[entry.name as ReportCategory]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>New Reports in Last 30 Days</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={reportsOverTime}>
                            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="count" name="New Reports" stroke="hsl(var(--primary))" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    )
}
