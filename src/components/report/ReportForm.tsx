'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { MapPin, Image as ImageIcon, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

import { submitReport, type FormState } from '@/lib/actions';
import { reportCategories, ReportCategory } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const reportFormSchema = z.object({
  category: z.nativeEnum(ReportCategory, {
    required_error: 'Please select a category.',
  }),
  description: z.string().min(10, {
    message: 'Description must be at least 10 characters.',
  }),
  latitude: z.string().min(1, { message: 'Location is required.' }),
  longitude: z.string().min(1, { message: 'Location is required.' }),
  photo: z.string().optional(),
});

type ReportFormValues = z.infer<typeof reportFormSchema>;

const initialState: FormState = {
  status: 'idle',
  message: '',
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {pending ? 'Submitting...' : 'Submit Report'}
    </Button>
  );
}

export default function ReportForm() {
  const [formState, dispatch] = useFormState(submitReport, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();

  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>(
    'idle'
  );
  const [locationError, setLocationError] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      description: '',
      latitude: '',
      longitude: '',
    },
  });

  useEffect(() => {
    if (formState.status === 'success') {
      toast({
        title: 'Success!',
        description: formState.message,
      });
      form.reset();
      setPhotoPreview(null);
      setLocationStatus('idle');
      formRef.current?.reset();
    } else if (formState.status === 'error') {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: formState.message,
      });
    }
  }, [formState, toast, form]);
  
  const placeholderImage = PlaceHolderImages.find(img => img.id === 'report-placeholder');

  const handleGetLocation = () => {
    setLocationStatus('loading');
    setLocationError('');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        form.setValue('latitude', position.coords.latitude.toString());
        form.setValue('longitude', position.coords.longitude.toString());
        setLocationStatus('success');
      },
      (error) => {
        setLocationStatus('error');
        setLocationError(error.message);
      }
    );
  };

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

  return (
    <>
      <Form {...form}>
        <form ref={formRef} action={dispatch} className="space-y-8">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a report category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {reportCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
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
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="Tell us more about the issue..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormItem>
            <FormLabel>Location</FormLabel>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" onClick={handleGetLocation} disabled={locationStatus === 'loading'}>
                {locationStatus === 'loading' ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <MapPin className="mr-2 h-4 w-4" />
                )}
                Use My Location
              </Button>
              {locationStatus === 'success' && <CheckCircle className="h-5 w-5 text-green-500" />}
              {locationStatus === 'error' && <AlertCircle className="h-5 w-5 text-destructive" />}
            </div>
            {locationStatus === 'success' && (
              <FormDescription>Location captured successfully!</FormDescription>
            )}
            {locationStatus === 'error' && (
              <p className="text-sm font-medium text-destructive">{locationError}</p>
            )}
            <input type="hidden" {...form.register('latitude')} />
            <input type="hidden" {...form.register('longitude')} />
             <FormMessage>{form.formState.errors.latitude?.message}</FormMessage>
          </FormItem>
          
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
          
          <SubmitButton />
        </form>
      </Form>
    </>
  );
}
