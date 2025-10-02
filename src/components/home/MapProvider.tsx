'use client';
import { APIProvider } from '@vis.gl/react-google-maps';
import { ReactNode } from 'react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { TriangleAlert } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

export default function MapProvider({ children }: { children: ReactNode }) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (typeof window === 'undefined') {
    // On the server, we can't access the env var, so render a skeleton.
    return <Skeleton className="w-full h-full" />;
  }

  if (!apiKey) {
    return (
      <Alert variant="destructive" className="h-full flex flex-col justify-center items-center text-center">
        <TriangleAlert className="h-6 w-6 mb-2" />
        <AlertTitle>Map Configuration Error</AlertTitle>
        <AlertDescription>
          The Google Maps API key is missing. Please add it to a `.env.local` file as `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` to enable map functionality.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <APIProvider apiKey={apiKey}>
        {children}
    </APIProvider>
  );
}
