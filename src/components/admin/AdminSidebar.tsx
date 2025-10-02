
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Users, BarChart, UserCircle, LogOut, Building, UserCog, Files, Megaphone } from 'lucide-react';
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
import { UserRole, UserProfile, DepartmentAdminRoles } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';

const isDepartmentAdmin = (role: UserRole) => DepartmentAdminRoles.includes(role);

const allMenuItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, roles: [UserRole.SuperAdmin, ...DepartmentAdminRoles] },
  { href: '/admin/reports', label: 'Reports', icon: Files, roles: [UserRole.SuperAdmin]},
  { href: '/admin/my-department', label: 'My Department', icon: Building, roles: DepartmentAdminRoles },
  { href: '/admin/users', label: 'Users', icon: Users, roles: [UserRole.SuperAdmin] },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart, roles: [UserRole.SuperAdmin] },
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
      return allMenuItems.filter(item => item.roles.includes(adminData.role!));
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
                <SidebarMenuItem key={item.label}>
                <Link href={item.href} passHref>
                    <SidebarMenuButton
                    isActive={pathname.startsWith(item.href) && (item.href !== '/admin' || pathname === '/admin')}
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
