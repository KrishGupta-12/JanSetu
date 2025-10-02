'use client';
import { Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import { Report, ReportStatus, ReportCategory } from '@/lib/types';
import { Home, Trash, Car, Lightbulb, Droplets } from 'lucide-react';

const categoryIcons = {
  [ReportCategory.Waste]: <Trash className="h-5 w-5 text-white" />,
  [ReportCategory.Pothole]: <Car className="h-5 w-5 text-white" />,
  [ReportCategory.Streetlight]: <Lightbulb className="h-5 w-5 text-white" />,
  [ReportCategory.Water]: <Droplets className="h-5 w-5 text-white" />,
  [ReportCategory.Other]: <Home className="h-5 w-5 text-white" />,
};

const categoryColors = {
  [ReportCategory.Waste]: 'bg-red-500',
  [ReportCategory.Pothole]: 'bg-blue-500',
  [ReportCategory.Streetlight]: 'bg-yellow-500',
  [ReportCategory.Water]: 'bg-cyan-500',
  [ReportCategory.Other]: 'bg-gray-500',
};


export default function MapView({ reports }: { reports: Report[] }) {
  const defaultCenter = {
    lat: 30.7333,
    lng: 76.7794,
  };

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <Map
        defaultCenter={defaultCenter}
        defaultZoom={12}
        mapId="JANSETU_MAP_ID"
        disableDefaultUI={true}
      >
        {reports.map((report) => (
          <AdvancedMarker key={report.id} position={{ lat: report.latitude, lng: report.longitude }}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${categoryColors[report.category]}`}>
              {categoryIcons[report.category]}
            </div>
          </AdvancedMarker>
        ))}
      </Map>
    </div>
  );
}
