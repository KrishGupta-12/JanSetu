import ReportTable from '@/components/admin/ReportTable';
import { mockReports } from '@/lib/data';

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-headline font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage and track all citizen reports.</p>
      </div>
      <ReportTable reports={mockReports} />
    </div>
  );
}
