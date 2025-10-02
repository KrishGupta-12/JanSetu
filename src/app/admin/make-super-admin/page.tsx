
'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ShieldCheck } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { doc, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export default function MakeSuperAdminPage() {
  const { user, firestore } = useAuth();
  const { toast } = useToast();
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleMakeSuperAdmin = async () => {
    if (!user || !firestore) {
      setErrorMessage('You must be logged in to perform this action.');
      setStatus('error');
      return;
    }

    setStatus('loading');
    try {
      const superAdminRef = doc(firestore, 'superAdmins', user.uid);
      // The data being set is simple, just to mark the document's existence.
      await setDoc(superAdminRef, { isAdmin: true });

      toast({
        title: 'Success!',
        description: 'You have been granted Super Admin privileges. Please refresh the page for changes to take effect.',
      });
      setStatus('success');
    } catch (error: any) {
      console.error('Error making super admin:', error);
      setErrorMessage(error.message || 'An unknown error occurred.');
      setStatus('error');
    }
  };

  if (!user) {
    return (
        <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    )
  }

  return (
    <div className="container mx-auto max-w-lg py-8">
      <Card>
        <CardHeader>
          <CardTitle>Grant Super Admin Privileges</CardTitle>
          <CardDescription>
            This is a one-time utility to grant super admin rights to your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTitle>Warning!</AlertTitle>
            <AlertDescription>
              Clicking this button will grant full administrative control to the currently logged-in user: <strong>{user?.email}</strong>.
              This action writes a document to the 'superAdmins' collection to grant permissions.
            </AlertDescription>
          </Alert>

          {status === 'idle' && (
            <Button onClick={handleMakeSuperAdmin} className="w-full">
              Make Me Super Admin
            </Button>
          )}

          {status === 'loading' && (
            <Button disabled className="w-full">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </Button>
          )}
          
          {status === 'success' && (
             <Alert variant="default" className="bg-green-100 dark:bg-green-900/30 border-green-500 text-green-800 dark:text-green-300">
                <ShieldCheck className="h-4 w-4" />
                <AlertTitle>Success!</AlertTitle>
                <AlertDescription>
                    Super admin privileges have been granted. Please refresh the page or log out and log back in for the changes to take full effect.
                </AlertDescription>
             </Alert>
          )}

          {status === 'error' && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
