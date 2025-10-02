'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, UserCircle, LogOut, Files, Megaphone, Trophy, FilePlus, Bell } from 'lucide-react';
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
import { Skeleton } from '../ui/skeleton';

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/report', label: 'New Report', icon: FilePlus },
  { href: '/dashboard/my-reports', label: 'My Reports', icon: Files },
  { href: '/dashboard/feed', label: 'Community Feed', icon: Megaphone },
  { href: '/dashboard/leaderboard', label: 'Leaderboard', icon: Trophy },
  { href: '/dashboard/alerts', label: 'Alerts', icon: Bell },
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

export default function UserSidebar() {
  const pathname = usePathname();
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

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
