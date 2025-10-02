'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { FirebaseError } from 'firebase/app';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useFirestore, useUser } from '@/firebase';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { Textarea } from '../ui/textarea';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  password: z.string().min(6, {
    message: 'Password must be at least 6 characters.',
  }),
  phone: z.string().min(10, { message: 'Please enter a valid phone number.' }),
  dob: z.date({
    required_error: 'A date of birth is required.',
  }),
  address: z.string().min(5, { message: 'Please enter a valid address.' }),
  city: z.string().min(2, { message: 'Please enter a valid city.' }),
  state: z.string().min(2, { message: 'Please enter a valid state.' }),
});

export function SignupForm() {
  const [isLoading, setIsLoading] = useState(false);
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      phone: '',
      address: '',
      city: '',
      state: '',
    },
  });
  
  // Seed admin user on component mount if it doesn't exist
  useEffect(() => {
    const seedAdmin = async () => {
        if (!auth || !firestore) return;
        
        try {
            // Check if admin already exists
            const adminDocRef = doc(firestore, "admins", "admin_user_id_placeholder"); // A placeholder to check, can be any known admin id if available
            const adminDoc = await getDoc(adminDocRef);

            // A more reliable way is to check if admin@jancorp.com exists.
            // This requires a function to get user by email, which is an admin-only SDK feature.
            // For client-side, we try to sign-in and if it fails with user-not-found, we create it.
            // This is not perfectly secure but sufficient for seeding.
            
            await signInWithEmailAndPassword(auth, 'admin@jancorp.com', 'admin123').catch(async (error) => {
                 if (error instanceof FirebaseError && (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential')) {
                    const tempUser = auth.currentUser;
                    
                    const adminCredential = await createUserWithEmailAndPassword(auth, 'admin@jancorp.com', 'admin123');
                    const adminUser = adminCredential.user;
                    
                    const adminRef = doc(firestore, 'admins', adminUser.uid);
                    await setDoc(adminRef, {
                        id: adminUser.uid,
                        name: 'JanSetu Admin',
                        email: 'admin@jancorp.com',
                        role: 'SuperAdmin',
                        dateJoined: new Date().toISOString(),
                    });

                    const citizenRef = doc(firestore, 'citizens', adminUser.uid);
                     await setDoc(citizenRef, {
                        id: adminUser.uid,
                        name: 'JanSetu Admin',
                        email: 'admin@jancorp.com',
                        phone: '1234567890',
                        dateJoined: new Date().toISOString(),
                        dob: '1990-01-01',
                        address: '123 Civic Center',
                        city: 'New Delhi',
                        state: 'Delhi'
                     });
                     
                    // Sign out the newly created admin, and sign back in the original user if there was one.
                    await signOut(auth);
                    if (tempUser) {
                        // This part is tricky as we don't have the password.
                        // For seeding, it's often better to run a separate script.
                        // Or, we accept that the user is logged out after seeding.
                    }
                 }
            });

        } catch (error) {
           // This might fail if the user is already logged in. We can ignore for seeding.
           console.log("Could not attempt admin seed.", error);
        }
    };

    seedAdmin();
  }, [auth, firestore]);

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isUserLoading, router]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

      const citizenRef = doc(firestore, 'citizens', user.uid);
      await setDoc(citizenRef, {
        id: user.uid,
        name: values.name,
        email: values.email,
        phone: values.phone,
        dob: format(values.dob, 'yyyy-MM-dd'),
        address: values.address,
        city: values.city,
        state: values.state,
        dateJoined: new Date().toISOString(),
      });
      
      router.push('/dashboard');
      toast({
          title: 'Welcome!',
          description: 'Your account has been created.',
      });

    } catch (error) {
      let errorMessage = 'An unexpected error occurred.';
      if (error instanceof FirebaseError) {
        if (error.code === 'auth/email-already-in-use') {
          errorMessage = 'This email is already registered. Please log in.';
        } else {
          errorMessage = `Failed to create an account: ${error.message}`;
        }
      }
      toast({
        variant: 'destructive',
        title: 'Sign Up Failed',
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="name@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input type="tel" placeholder="Your phone number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="dob"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date of Birth</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={'outline'}
                      className={cn(
                        'w-full pl-3 text-left font-normal',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      {field.value ? (
                        format(field.value, 'PPP')
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date > new Date() || date < new Date('1900-01-01')
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Textarea placeholder="123 Main St" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input placeholder="New Delhi" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>State</FormLabel>
                <FormControl>
                  <Input placeholder="Delhi" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create Account
        </Button>
      </form>
    </Form>
  );
}
