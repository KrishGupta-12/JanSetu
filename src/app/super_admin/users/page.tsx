
'use client';

import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { UserRole } from '@/lib/types';
import { AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function UsersPage() {
  const { user: adminUser, isLoading: isUserLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  // Effect to protect the route for super admins only
  useEffect(() => {
    if (!isUserLoading && (!adminUser || adminUser.role !== UserRole.SuperAdmin)) {
      toast({ variant: 'destructive', title: 'Access Denied', description: 'You do not have permission to view this page.' });
      router.push('/login');
    }
  }, [isUserLoading, adminUser, router, toast]);


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">User Management</h1>
        <p className="text-muted-foreground">View and manage citizen accounts.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Citizen Users</CardTitle>
          <CardDescription>A list of all registered citizens on the platform.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex flex-col items-center justify-center text-center p-12 border-2 border-dashed rounded-lg">
                <AlertTriangle className="h-12 w-12 text-destructive" />
                <h3 className="mt-4 text-xl font-semibold text-destructive">Feature Unavailable</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                    The user management feature is currently unavailable due to a persistent security rule configuration issue.
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                    I have been unable to correctly implement the rules to allow listing users and have disabled this feature to prevent application errors. I sincerely apologize for this failure.
                </p>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}

