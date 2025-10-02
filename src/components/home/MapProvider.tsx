'use client';
import { APIProvider } from '@vis.gl/react-google-maps';
import { ReactNode, useEffect, useState } from 'react';
import { Skeleton } from '../ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { TriangleAlert } from 'lucide-react';

export default function MapProvider({ children }: { children: ReactNode }) {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // This code runs only on the client
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (key) {
      setApiKey(key);
    }
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <Skeleton className="w-full h-full" />;
  }

  if (!apiKey) {
    return (
      <Alert variant="destructive" className="h-full flex flex-col justify-center">
        <TriangleAlert className="h-4 w-4" />
        <AlertTitle>Map Configuration Error</AlertTitle>
        <AlertDescription>
          The Google Maps API key is missing. Please add it to your environment variables as NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to enable map functionality.
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
