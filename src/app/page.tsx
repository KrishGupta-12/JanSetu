import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import MapView from '@/components/home/MapView';
import AqiCard from '@/components/home/AqiCard';
import DisasterAlert from '@/components/home/DisasterAlert';
import { MapProvider } from '@/components/home/MapProvider';

export default function Home() {
  return (
    <div className="flex-1 w-full relative">
      <div className="container mx-auto grid grid-cols-1 xl:grid-cols-12 gap-6 p-4 sm:p-6 h-full">
        <div className="xl:col-span-8 rounded-xl shadow-lg overflow-hidden h-[400px] xl:h-auto flex flex-col bg-card">
          <MapProvider>
            <MapView />
          </MapProvider>
        </div>
        <div className="xl:col-span-4 flex flex-col gap-6">
          <AqiCard />
          <Card className="flex-1 shadow-lg">
            <CardHeader>
              <CardTitle>Community Action</CardTitle>
              <CardDescription>Found an issue? Let us know.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full" size="lg">
                <Link href="/report">Report an Issue</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      <DisasterAlert />
    </div>
  );
}
