
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Users, BarChart, UserCircle, LogOut, Building, Files, Megaphone, Shield, UserX, DollarSign } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import Logo from '@/components/common/Logo';
import { useAuth } from '@/hooks/useAuth';
import { useMemo } from 'react';
import { UserRole, DepartmentAdminRoles } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';

const isDepartmentAdmin = (role: UserRole) => DepartmentAdminRoles.includes(role);

const allMenuItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, roles: [...DepartmentAdminRoles] },
  { href: '/super_admin', label: 'Dashboard', icon: Shield, roles: [UserRole.SuperAdmin] },
  { href: '/super_admin/reports', label: 'All Reports', icon: Files, roles: [UserRole.SuperAdmin] },
  { href: '/admin/my-department', label: 'My Department', icon: Building, roles: DepartmentAdminRoles },
  { href: '/super_admin/department-stats', label: 'Department Stats', icon: BarChart, roles: [UserRole.SuperAdmin] },
  { href: '/super_admin/budget-stats', label: 'Budget Stats', icon: DollarSign, roles: [UserRole.SuperAdmin] },
  { href: '/super_admin/users', label: 'User Management', icon: UserX, roles: [UserRole.SuperAdmin] },
  { href: '/super_admin/analytics', label: 'Analytics', icon: BarChart, roles: [UserRole.SuperAdmin] },
  { href: '/admin/alerts', label: 'Alerts', icon: Megaphone, roles: [UserRole.SuperAdmin, ...DepartmentAdminRoles] },
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
  const { user: adminData, isLoading, logout } = useAuth();
  const router = useRouter();

  const menuItems = useMemo(() => {
      if (!adminData || !adminData.role) return [];
      const userRoles = [adminData.role];
      if (adminData.role === UserRole.SuperAdmin) {
        // Super admin sees their own items and shared items
        return allMenuItems.filter(item => item.roles.includes(UserRole.SuperAdmin));
      }
      // Dept admin sees their own items and shared items
      return allMenuItems.filter(item => item.roles.some(r => userRoles.includes(r) && r !== UserRole.SuperAdmin));
  }, [adminData]);

  const handleSignOut = () => {
    logout();
    router.push('/');
  };


  return (
    <Sidebar>
      <SidebarHeader>
        <Logo />
      </SidebarHeader>
      <SidebarContent>
        {isLoading ? <SidebarSkeleton /> : (
            <SidebarMenu>
            {menuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
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
      <SidebarFooter className="mt-auto">
        <SidebarSeparator />
         <SidebarMenuItem>
            <Link href="/profile" passHref>
                <SidebarMenuButton
                isActive={pathname === '/profile'}
                tooltip="Profile"
                as="a"
                >
                <UserCircle />
                <span>Profile</span>
                </SidebarMenuButton>
            </Link>
        </SidebarMenuItem>
        <SidebarMenuItem>
             <SidebarMenuButton
              tooltip="Sign Out"
              onClick={handleSignOut}
            >
              <LogOut />
              <span>Sign Out</span>
            </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarFooter>
    </Sidebar>
  );
}
