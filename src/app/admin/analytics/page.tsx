'use client'
import { Report, ReportCategory, ReportStatus } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { useMemo } from 'react';
import { mockReports } from '@/lib/data';

const statusColors: {[key in ReportStatus]: string} = {
    [ReportStatus.Pending]: '#FBBF24', // amber-400
    [ReportStatus.InProgress]: '#3B82F6', // blue-500
    [ReportStatus.Resolved]: '#10B981', // emerald-500
}

const categoryColors: {[key in ReportCategory]: string} = {
    [ReportCategory.Waste]: '#EF4444', // red-500
    [ReportCategory.Pothole]: '#F97316', // orange-500
    [ReportCategory.Streetlight]: '#8B5CF6', // violet-500
    [ReportCategory.Water]: '#0EA5E9', // sky-500
    [ReportCategory.Other]: '#64748B' // slate-500
}


export default function AnalyticsPage() {
    const reports = mockReports;

    const reportsByStatus = useMemo(() => {
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
        const counts = Object.values(ReportCategory).reduce((acc, category) => {
            acc[category] = 0;
            return acc;
        }, {} as Record<ReportCategory, number>);

        reports.forEach(report => {
            counts[report.category]++;
        });
        
        return Object.entries(counts).map(([name, value]) => ({ name, value }));

    }, [reports]);


    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight font-headline">Analytics</h1>
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
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
                 <Card>
                    <CardHeader>
                        <CardTitle>Reports by Category</CardTitle>
                    </CardHeader>
                    <CardContent>
                         <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={reportsByCategory}>
                                <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} />
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
        </div>
    )
}
