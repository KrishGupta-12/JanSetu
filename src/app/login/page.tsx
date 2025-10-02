
'use client';

import { LoginForm } from '@/components/auth/LoginForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="container mx-auto flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">Login to Your Account</CardTitle>
          <CardDescription>Enter your email and password to access your dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
          <p className="mt-8 text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link href="/signup" className="font-semibold text-primary hover:underline">
              Sign up here
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
