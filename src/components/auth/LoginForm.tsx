'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';
import { Loader2, User, UserCog, Shield } from 'lucide-react';
import { mockCitizens, mockAdmins } from '@/lib/data';
import { AdminRole } from '@/lib/types';

type DemoUser = {
  email: string;
  name: string;
  role: string;
  icon: React.ReactNode;
};

const demoUsers: DemoUser[] = [
  { email: 'amit.kumar@example.com', name: 'Amit Kumar', role: 'Citizen', icon: <User /> },
  { email: 'priya.sharma@example.com', name: 'Priya Sharma', role: 'Citizen', icon: <User /> },
  { email: 'super.admin@jancorp.com', name: 'Super Admin', role: 'Municipal Head', icon: <Shield /> },
  { email: 'waste.admin@jancorp.com', name: 'Waste Dept.', role: 'Admin', icon: <UserCog /> },
  { email: 'pothole.admin@jancorp.com', name: 'Pothole Dept.', role: 'Admin', icon: <UserCog /> },
  { email: 'streetlight.admin@jancorp.com', name: 'Streetlight Dept.', role: 'Admin', icon: <UserCog /> },
];


export function LoginForm() {
  const [loadingUser, setLoadingUser] = useState<string | null>(null);
  const { login } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleDemoLogin = async (email: string) => {
    setLoadingUser(email);
    
    const password = 'password123';
    
    const result = await login(email, password);

    if (result.success) {
      // The useAuth hook will handle fetching the user profile and redirecting.
      // We can optimistically check the email to decide where to navigate.
      const isAdmin = demoUsers.find(u => u.email === email && (u.role === 'Admin' || u.role === 'Municipal Head'));
      
      toast({
        title: 'Success',
        description: 'Logged in successfully!',
      });
      
      if (isAdmin) {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }

    } else {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: result.message,
      });
    }
    setLoadingUser(null);
  };

  return (
    <div className="space-y-4">
      {demoUsers.map((demoUser) => (
        <Button
          key={demoUser.email}
          onClick={() => handleDemoLogin(demoUser.email)}
          disabled={!!loadingUser}
          className="w-full justify-start h-14"
          variant="outline"
        >
          {loadingUser === demoUser.email ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <span className="mr-4 text-primary">{demoUser.icon}</span>
          )}
          <div className="text-left">
            <p className="font-semibold">{demoUser.name}</p>
            <p className="text-xs text-muted-foreground">{demoUser.role}</p>
          </div>
        </Button>
      ))}
    </div>
  );
}
