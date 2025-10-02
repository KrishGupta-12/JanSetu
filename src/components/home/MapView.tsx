'use client';

import { Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import {
  Trash2,
  Wrench,
  LightbulbOff,
  CloudRain,
  HelpCircle,
} from 'lucide-react';
import { Report, ReportCategory } from '@/lib/types';
import { mockAqiSensors, mockReports } from '@/lib/data';


const ReportIcon = ({ category }: { category: ReportCategory }) => {
  const commonClass = 'w-5 h-5';
  switch (category) {
    case ReportCategory.Waste:
      return <Trash2 className={commonClass} />;
    case ReportCategory.Pothole:
      return <Wrench className={commonClass} />;
    case ReportCategory.Streetlight:
      return <LightbulbOff className={commonClass} />;
    case ReportCategory.Water:
      return <CloudRain className={commonClass} />;
    default:
      return <HelpCircle className={commonClass} />;
  }
};

const MapView = () => {
  const defaultCenter = { lat: 28.6139, lng: 77.209 };
  const reports = mockReports;


  return (
    <Map
      style={{ width: '100%', height: '100%' }}
      defaultCenter={defaultCenter}
      defaultZoom={12}
      gestureHandling={'greedy'}
      disableDefaultUI={true}
      mapId="a2b3c4d5e6f7g8h9"
    >
      {reports?.map((report) => (
        <AdvancedMarker key={report.id} position={{ lat: report.latitude, lng: report.longitude }} title={report.description}>
          <Pin background={'#FF8A65'} borderColor={'#FF8A65'} glyphColor={'#FFF'}>
            <ReportIcon category={report.category} />
          </Pin>
        </AdvancedMarker>
      ))}
      {mockAqiSensors.map((sensor) => (
        <AdvancedMarker key={sensor.id} position={sensor.location} title={`AQI: ${sensor.aqi}`}>
           <Pin background={'#4DB6AC'} borderColor={'#4DB6AC'} glyphColor={'#FFF'}>
            <span className="font-bold text-sm">{sensor.aqi}</span>
          </Pin>
        </AdvancedMarker>
      ))}
    </Map>
  );
};

export default MapView;
