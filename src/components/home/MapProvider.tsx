
'use client';
import { APIProvider } from '@vis.gl/react-google-maps';
import { Skeleton } from '@/components/ui/skeleton';
import { useState, useEffect } from 'react';

export function MapProvider({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);
  // It's important to access environment variables only on the client-side for `NEXT_PUBLIC_` vars
  // to be available after the initial server render.
  const [apiKey, setApiKey] = useState<string | undefined>(undefined);

  useEffect(() => {
    setIsClient(true);
    setApiKey(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);
  }, []);

  if (!isClient) {
    return <Skeleton className="w-full h-full" />;
  }

  if (!apiKey) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-muted/50 p-4">
        <div className="text-center rounded-lg border bg-card p-6">
          <h3 className="font-semibold text-card-foreground">Google Maps API Key Missing</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Please add your Google Maps API key to a <code className="font-mono bg-muted px-1 py-0.5 rounded">.env.local</code> file to enable maps.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            <code className="font-mono bg-muted px-1 py-0.5 rounded">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_API_KEY</code>
          </p>
        </div>
      </div>
    );
  }

  return <APIProvider apiKey={apiKey}>{children}</APIProvider>;
}
