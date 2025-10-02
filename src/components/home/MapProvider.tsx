'use client';
import { APIProvider } from '@vis.gl/react-google-maps';
import { ReactNode, useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { TriangleAlert } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

export default function MapProvider({ children }: { children: ReactNode }) {
  const [apiKey, setApiKey] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Access environment variable only on the client side
    setApiKey(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);
    setLoading(false);
  }, []);

  if (loading) {
    // While checking for the key, show a skeleton loader
    return <Skeleton className="w-full h-full" />;
  }

  if (!apiKey) {
    return (
      <Alert variant="destructive" className="h-full flex flex-col justify-center items-center text-center">
        <TriangleAlert className="h-6 w-6 mb-2" />
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
