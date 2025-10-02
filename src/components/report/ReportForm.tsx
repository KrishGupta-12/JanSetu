
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

import { submitReport, ReportFormValues } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ReportCategory } from '@/lib/types';
import { reportCategories } from '@/lib/data';

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
  photo: z.string().optional(),
  citizenId: z.string().min(1, { message: 'Citizen ID is missing.' }),
});


export default function ReportForm() {
  const { user, isLoading: isUserLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  
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
      photo: '',
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

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        form.setValue('photo', base64String);
        setPhotoPreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  async function onSubmit(values: ReportFormValues) {
    setIsSubmitting(true);
    const result = await submitReport(values);

    if (result.status === 'success') {
      toast({
        title: 'Success!',
        description: result.message,
      });
      form.reset();
      setPhotoPreview(null);
      router.push('/dashboard/my-reports');
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.message,
      });
    }
    setIsSubmitting(false);
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
          
          <FormItem>
            <FormLabel>Photo (Optional)</FormLabel>
             <FormControl>
                <div className="relative w-full h-48 border-2 border-dashed rounded-lg flex items-center justify-center bg-muted/50 hover:border-primary transition-colors">
                    <Input id="photo-upload" type="file" accept="image/*" className="absolute w-full h-full opacity-0 cursor-pointer" onChange={handlePhotoChange} />
                    {photoPreview ? (
                        <Image src={photoPreview} alt="Preview" fill style={{ objectFit: 'cover' }} className="rounded-lg" />
                    ) : (
                        <div className="text-center text-muted-foreground">
                            <ImageIcon className="mx-auto h-10 w-10" />
                            <p className="mt-2 text-sm">Click or drag to upload a photo</p>
                        </div>
                    )}
                </div>
            </FormControl>
            <FormDescription>
                A photo helps us understand the issue better. Faces will be automatically blurred for privacy.
            </FormDescription>
            <input type="hidden" {...form.register('photo')} />
            <FormMessage />
          </FormItem>
          
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </Button>
        </form>
      </Form>
    </>
  );
}
