'use client';

import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';
import AdminLayout from '@/app/admin/layout';
import DashboardLayout from '@/app/dashboard/layout';
import { UserRole } from '@/lib/types';
import SuperAdminLayout from '../super_admin/layout';

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading || !user) {
    return (
      <div className="p-8">
        <Skeleton className="h-screen w-full" />
      </div>
    );
  }

  // Route to the correct layout based on user role
  if (user.role === UserRole.SuperAdmin) {
    return <SuperAdminLayout>{children}</SuperAdminLayout>;
  } else if (user.role !== UserRole.Citizen) {
    return <AdminLayout>{children}</AdminLayout>;
  }

  // Otherwise, they are a citizen
  return <DashboardLayout>{children}</DashboardLayout>;
}
