'use client';

import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';
import AdminLayout from '@/app/admin/layout';
import DashboardLayout from '@/app/dashboard/layout';

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading || !user) {
    return (
      <div className="p-8">
        <Skeleton className="h-screen w-full" />
      </div>
    );
  }

  // If user has a role, they are an admin
  if (user.role) {
    return <AdminLayout>{children}</AdminLayout>;
  }

  // Otherwise, they are a citizen
  return <DashboardLayout>{children}</DashboardLayout>;
}
