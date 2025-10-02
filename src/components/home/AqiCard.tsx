'use client';
import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Wind, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getAqi } from '@/ai/flows/get-aqi';
import { Skeleton } from '../ui/skeleton';

const getAqiColor = (aqi: number) => {
  if (aqi <= 50) return { color: 'bg-green-500', textColor: 'text-green-800 dark:text-green-300' };
  if (aqi <= 100) return { color: 'bg-yellow-500', textColor: 'text-yellow-800 dark:text-yellow-300' };
  if (aqi <= 150) return { color: 'bg-orange-500', textColor: 'text-orange-800 dark:text-orange-300' };
  if (aqi <= 200) return { color: 'bg-red-500', textColor: 'text-red-800 dark:text-red-300' };
  if (aqi <= 300) return { color: 'bg-purple-500', textColor: 'text-purple-800 dark:text-purple-300' };
  return { color: 'bg-maroon-500', textColor: 'text-maroon-800 dark:text-maroon-300' };
};

export default function AqiCard() {
  const [aqiData, setAqiData] = useState<{ aqi: number; level: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAqi = async () => {
      setIsLoading(true);
      try {
        const data = await getAqi({ city: 'Chandigarh' });
        setAqiData(data);
      } catch (error) {
        console.error('Failed to fetch AQI data:', error);
        // Set a fallback or error state if needed
        setAqiData({aqi: 0, level: "Error"});
      }
      setIsLoading(false);
    };

    fetchAqi();
  }, []);

  if (isLoading || !aqiData) {
      return (
          <Card className="shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Live Air Quality</CardTitle>
                  <Wind className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                  <Skeleton className="h-12 w-24 mb-2"/>
                  <Skeleton className="h-4 w-48 mb-4"/>
                  <Skeleton className="h-2 w-full" />
              </CardContent>
          </Card>
      )
  }

  const { aqi, level } = aqiData;
  const { color, textColor } = getAqiColor(aqi);

  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Live Air Quality</CardTitle>
        <Wind className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-5xl font-bold font-headline">{aqi}</div>
        <p className={cn("text-xs font-semibold mt-1", textColor)}>{level}</p>
        <div className="mt-4 h-2 w-full bg-muted rounded-full overflow-hidden">
          <div className={cn("h-full rounded-full", color)} style={{ width: `${(aqi / 300) * 100}%` }}></div>
        </div>
      </CardContent>
    </Card>
  );
}
