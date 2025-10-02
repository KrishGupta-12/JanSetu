'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';
import { Loader2, User, UserCog, Shield } from 'lucide-react';
import { mockCitizens, mockAdmins } from '@/lib/data';

type DemoUser = {
  email: string;
  name: string;
  role: string;
  icon: React.ReactNode;
};

const demoUsers: DemoUser[] = [
  { email: mockCitizens[0].email, name: mockCitizens[0].name, role: 'Citizen', icon: <User /> },
  { email: mockCitizens[1].email, name: mockCitizens[1].name, role: 'Citizen', icon: <User /> },
  { email: mockAdmins[0].email, name: 'Super Admin', role: 'Municipal Head', icon: <Shield /> },
  { email: mockAdmins[1].email, name: 'Waste Dept.', role: 'Admin', icon: <UserCog /> },
  { email: mockAdmins[2].email, name: 'Pothole Dept.', role: 'Admin', icon: <UserCog /> },
  { email: mockAdmins[3].email, name: 'Streetlight Dept.', role: 'Admin', icon: <UserCog /> },
];


export function LoginForm() {
  const [loadingUser, setLoadingUser] = useState<string | null>(null);
  const { login } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleDemoLogin = (email: string, password_unused: string) => {
    setLoadingUser(email);
    
    // The password is 'admin123' for all mock users
    const password = 'admin123';
    
    setTimeout(() => {
      const result = login(email, password);

      if (result.success) {
        const isAdmin = mockAdmins.some(admin => admin.email === email);
        if (isAdmin) {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
        toast({
          title: 'Success',
          description: 'Logged in successfully!',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Login Failed',
          description: result.message,
        });
      }
      setLoadingUser(null);
    }, 500);
  };

  return (
    <div className="space-y-4">
      {demoUsers.map((demoUser) => (
        <Button
          key={demoUser.email}
          onClick={() => handleDemoLogin(demoUser.email, 'admin123')}
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
