import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Wind } from 'lucide-react';
import { cn } from '@/lib/utils';

const getAqiInfo = (aqi: number) => {
  if (aqi <= 50) return { level: 'Good', color: 'bg-green-500', textColor: 'text-green-800' };
  if (aqi <= 100) return { level: 'Moderate', color: 'bg-yellow-500', textColor: 'text-yellow-800' };
  if (aqi <= 150) return { level: 'Unhealthy for Sensitive Groups', color: 'bg-orange-500', textColor: 'text-orange-800' };
  if (aqi <= 200) return { level: 'Unhealthy', color: 'bg-red-500', textColor: 'text-red-800' };
  if (aqi <= 300) return { level: 'Very Unhealthy', color: 'bg-purple-500', textColor: 'text-purple-800' };
  return { level: 'Hazardous', color: 'bg-maroon-500', textColor: 'text-maroon-800' };
};

export default function AqiCard() {
  const currentAqi = 158; // Mock data
  const { level, color, textColor } = getAqiInfo(currentAqi);

  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Live Air Quality</CardTitle>
        <Wind className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-5xl font-bold font-headline">{currentAqi}</div>
        <p className={cn("text-xs font-semibold mt-1", textColor)}>{level}</p>
        <div className="mt-4 h-2 w-full bg-muted rounded-full overflow-hidden">
          <div className={cn("h-full rounded-full", color)} style={{ width: `${(currentAqi / 500) * 100}%` }}></div>
        </div>
      </CardContent>
    </Card>
  );
}
