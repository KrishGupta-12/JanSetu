'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Logo from './Logo';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Skeleton } from '../ui/skeleton';
import { LogOut, UserCircle } from 'lucide-react';
import { useMemo } from 'react';
import { mockAdmins } from '@/lib/data';

function HeaderAuth() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

  const handleSignOut = () => {
    logout();
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <Skeleton className="h-8 w-20 rounded-md" />
        <Skeleton className="h-8 w-20 rounded-md" />
      </div>
    );
  }

  if (user) {
    return (
      <>
        <Button variant="ghost" asChild>
          <Link href="/profile">
            <UserCircle className="mr-2" /> Profile
          </Link>
        </Button>
        <Button variant="ghost" onClick={handleSignOut}>
          <LogOut className="mr-2" /> Sign Out
        </Button>
      </>
    );
  }

  return (
    <>
      <Button variant="ghost" asChild>
        <Link href="/login">Login</Link>
      </Button>
      <Button asChild>
        <Link href="/signup">Sign Up</Link>
      </Button>
    </>
  );
}

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Logo />
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <HeaderAuth />
        </div>
      </div>
    </header>
  );
}
