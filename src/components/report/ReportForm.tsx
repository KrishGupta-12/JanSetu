
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

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
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Image as ImageIcon, Loader2, Ban } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ReportCategory, ReportStatus, ReportUrgency } from '@/lib/types';
import { reportCategories } from '@/lib/data';
import { collection, addDoc, doc, updateDoc, increment } from 'firebase/firestore';

const reportFormSchema = z.object({
  description: z.string().min(10, {
    message: 'Description must be at least 10 characters.',
  }),
  category: z.nativeEnum(ReportCategory, {
    required_error: 'Please select a category.',
  }),
  complainantName: z.string().min(1, { message: 'Name is required.' }),
  complainantPhone: z.string().min(1, { message: 'Phone number is required.' }),
  locationAddress: z.string().min(1, { message: 'Address is required.' }),
  imageUrl: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
  citizenId: z.string().min(1, { message: 'Citizen ID is missing.' }),
});

type ReportFormValues = z.infer<typeof reportFormSchema>;


export default function ReportForm() {
  const { user, isLoading: isUserLoading, firestore } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const isBanned = useMemo(() => {
    if (!user || !user.bannedUntil) return false;
    if (user.bannedUntil === 'lifetime') return true;
    return new Date(user.bannedUntil) > new Date();
  }, [user]);


  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      description: '',
      complainantName: '',
      complainantPhone: '',
      locationAddress: '',
      citizenId: '',
      imageUrl: '',
    },
  });

  useEffect(() => {
    if (user) {
      form.setValue('citizenId', user.uid);
      form.setValue('complainantName', user.name);
      form.setValue('complainantPhone', user.phone);
      form.setValue('locationAddress', user.address);
    }
  }, [user, form]);

  useEffect(() => {
    if (!isUserLoading && !user) {
        toast({
            title: "Authentication Required",
            description: "Please log in to report an issue.",
            variant: "destructive"
        })
        router.push('/login');
    }
  }, [user, isUserLoading, router, toast]);

  async function onSubmit(values: ReportFormValues) {
    if (!firestore || !user) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not connect to the database.' });
        return;
    }
    setIsSubmitting(true);
    
    try {
        const { imageUrl, description, citizenId, complainantName, complainantPhone, locationAddress, category } = values;
        
        // 1. Create the new report document
        const reportData = {
          citizenId,
          complainantName,
          complainantPhone,
          locationAddress,
          description,
          imageUrl: imageUrl || '',
          category,
          reportDate: new Date().toISOString(),
          status: ReportStatus.Pending,
          upvotes: 0,
          citizenIdsWhoUpvoted: [],
          urgency: 'Medium' as ReportUrgency,
        };
        
        const reportsCollection = collection(firestore, 'issueReports');
        await addDoc(reportsCollection, reportData);

        // 2. Increment the user's totalReports count
        const userDocRef = doc(firestore, 'users', user.uid);
        await updateDoc(userDocRef, {
            totalReports: increment(1)
        });

        // 3. Show success and redirect
        toast({
            title: 'Success!',
            description: 'Your report has been submitted successfully.',
        });
        form.reset();
        router.push('/dashboard/my-reports');

    } catch (error) {
        console.error('Error submitting report:', error);
        toast({
            variant: 'destructive',
            title: 'Error',
            description: error instanceof Error ? error.message : 'An unknown error occurred.',
        });
    } finally {
        setIsSubmitting(false);
    }
  }

  if (isUserLoading || !user) {
      return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin"/></div>
  }

  if (isBanned) {
      return (
          <Alert variant="destructive">
            <Ban className="h-4 w-4" />
            <AlertTitle>Account Suspended</AlertTitle>
            <AlertDescription>
                Your account is currently suspended from submitting new reports.
                {user.bannedUntil !== 'lifetime' && ` This suspension will be lifted on ${new Date(user.bannedUntil).toLocaleDateString()}.`}
            </AlertDescription>
          </Alert>
      )
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
           <input type="hidden" {...form.register('citizenId')} />
          
           <FormField
            control={form.control}
            name="complainantName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your full name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="complainantPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mobile Number</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your mobile number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="locationAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location / Address</FormLabel>
                <FormControl>
                  <Textarea placeholder="Enter the full address or landmark of the issue." {...field} />
                </FormControl>
                 <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an issue category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {reportCategories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description of Issue</FormLabel>
                <FormControl>
                  <Textarea placeholder="Tell us more about the issue..." {...field} />
                </FormControl>
                <FormDescription>
                 Please provide as much detail as possible.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Photo URL (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com/image.jpg" {...field} />
                </FormControl>
                 <FormDescription>
                 A photo helps us understand the issue better.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </Button>
        </form>
      </Form>
    </>
  );
}
