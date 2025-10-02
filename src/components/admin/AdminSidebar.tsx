'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Home, Users, BarChart } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import Logo from '@/components/common/Logo';
import { useAuth } from '@/hooks/useAuth';
import { useMemo } from 'react';
import { mockAdmins } from '@/lib/data';
import { AdminRole } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';

const allMenuItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, roles: [AdminRole.SuperAdmin, AdminRole.DepartmentAdmin] },
  { href: '/admin/users', label: 'Users', icon: Users, roles: [AdminRole.SuperAdmin] },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart, roles: [AdminRole.SuperAdmin] },
];

function SidebarSkeleton() {
    return (
         <div className="flex flex-col gap-2 p-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
         </div>
    )
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const { user, isLoading } = useAuth();

  const adminData = useMemo(() => {
    if (!user) return null;
    return mockAdmins.find(admin => admin.email === user.email);
  }, [user]);

  const menuItems = useMemo(() => {
      if (!adminData) return [];
      return allMenuItems.filter(item => item.roles.includes(adminData.role));
  }, [adminData])


  return (
    <Sidebar>
      <SidebarHeader>
        <Logo />
      </SidebarHeader>
      <SidebarContent>
        {isLoading ? <SidebarSkeleton /> : (
            <SidebarMenu>
            {menuItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                <Link href={item.href} passHref>
                    <SidebarMenuButton
                    isActive={pathname === item.href}
                    tooltip={item.label}
                    as="a"
                    >
                    <item.icon />
                    <span>{item.label}</span>
                    </SidebarMenuButton>
                </Link>
                </SidebarMenuItem>
            ))}
            </SidebarMenu>
        )}
      </SidebarContent>
      <SidebarFooter>
        <Link href="/dashboard" passHref>
          <SidebarMenuButton tooltip="Back to Dashboard" as="a">
            <Home />
            <span>Back to Dashboard</span>
          </SidebarMenuButton>
        </Link>
      </SidebarFooter>
    </Sidebar>
  );
}
