
'use client';
import { APIProvider } from '@vis.gl/react-google-maps';
import { Skeleton } from '@/components/ui/skeleton';
import { useState, useEffect } from 'react';

export function MapProvider({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);
  const [apiKey, setApiKey] = useState<string | undefined>(undefined);

  useEffect(() => {
    // This effect runs only on the client side.
    setIsClient(true);
    setApiKey(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);
  }, []);

  // While waiting for the client to mount and the API key to be read, show a skeleton.
  if (!isClient) {
    return <Skeleton className="w-full h-full" />;
  }

  // If the client has mounted but the API key is not available, show an error message.
  // This prevents rendering the APIProvider with an undefined key.
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

  // Only render the APIProvider when we have a valid key.
  return <APIProvider apiKey={apiKey}>{children}</APIProvider>;
}
