
'use client';

import { Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import {
  Trash2,
  Wrench,
  LightbulbOff,
  CloudRain,
  HelpCircle,
  Siren,
  Triangle,
  Square,
  Circle
} from 'lucide-react';
import { Report, ReportCategory, ReportUrgency } from '@/lib/types';
import { mockAqiSensors } from '@/lib/data';


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

const UrgencyIcon = ({ urgency }: { urgency: ReportUrgency }) => {
    const commonClass = "w-5 h-5";
    switch (urgency) {
        case 'Critical': return <Siren className={commonClass} />;
        case 'High': return <Triangle className={commonClass} />;
        case 'Medium': return <Square className={commonClass} />;
        case 'Low': return <Circle className={commonClass} />;
        default: return <HelpCircle className={commonClass} />;
    }
}

const getPinProps = (report: Report) => {
    switch (report.urgency) {
        case 'Critical': return { background: '#ef4444', borderColor: '#ef4444', glyphColor: '#fff' }; // red
        case 'High': return { background: '#f97316', borderColor: '#f97316', glyphColor: '#fff' }; // orange
        case 'Medium': return { background: '#eab308', borderColor: '#eab308', glyphColor: '#fff' }; // yellow
        case 'Low': return { background: '#84cc16', borderColor: '#84cc16', glyphColor: '#000' }; // lime
        default: return { background: '#FF8A65', borderColor: '#FF8A65', glyphColor: '#FFF' }; // default
    }
}

const MapView = ({ reports }: { reports?: Report[] }) => {
  const defaultCenter = { lat: 30.7333, lng: 76.7794 };

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
          <Pin {...getPinProps(report)}>
             {report.urgency ? <UrgencyIcon urgency={report.urgency}/> : <ReportIcon category={report.category} />}
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
