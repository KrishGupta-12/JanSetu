'use client';
import { APIProvider } from '@vis.gl/react-google-maps';
import { Skeleton } from '@/components/ui/skeleton';

export function MapProvider({ children }: { children: React.ReactNode }) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (typeof window === 'undefined') {
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
