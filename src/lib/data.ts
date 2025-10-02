import type { Report, AqiSensor } from './types';
import { ReportCategory, ReportStatus } from './types';

export const mockReports: Report[] = [
  {
    id: 'RPT-001',
    category: ReportCategory.Waste,
    description: 'Large pile of garbage overflowing from the public bin. It has been there for 3 days.',
    location: { lat: 28.6139, lng: 77.2090 },
    address: 'Connaught Place, New Delhi',
    photoUrl: 'https://picsum.photos/seed/1/400/300',
    status: ReportStatus.Pending,
    createdAt: new Date('2024-07-18T08:00:00Z'),
  },
  {
    id: 'RPT-002',
    category: ReportCategory.Pothole,
    description: 'Deep pothole on the main road causing traffic issues. Very dangerous for two-wheelers.',
    location: { lat: 28.5800, lng: 77.2100 },
    address: 'Hauz Khas Village, New Delhi',
    photoUrl: 'https://picsum.photos/seed/2/400/300',
    status: ReportStatus.InProgress,
    createdAt: new Date('2024-07-17T14:30:00Z'),
  },
  {
    id: 'RPT-003',
    category: ReportCategory.Streetlight,
    description: 'The streetlight at the corner of the street is not working. It is very dark at night.',
    location: { lat: 28.6315, lng: 77.2167 },
    address: 'Chandni Chowk, New Delhi',
    status: ReportStatus.Resolved,
    createdAt: new Date('2024-07-15T20:00:00Z'),
  },
  {
    id: 'RPT-004',
    category: ReportCategory.Water,
    description: 'Severe water logging after the rain yesterday. The road is completely submerged.',
    location: { lat: 28.6562, lng: 77.2410 },
    address: 'Red Fort, New Delhi',
    photoUrl: 'https://picsum.photos/seed/4/400/300',
    status: ReportStatus.Pending,
    createdAt: new Date('2024-07-19T09:15:00Z'),
  },
  {
    id: 'RPT-005',
    category: ReportCategory.Other,
    description: 'Broken public bench in the park. Needs immediate repair.',
    location: { lat: 28.6129, lng: 77.2295 },
    address: 'India Gate, New Delhi',
    status: ReportStatus.Resolved,
    createdAt: new Date('2024-07-10T11:00:00Z'),
  },
];

export const mockAqiSensors: AqiSensor[] = [
  {
    id: 'AQI-01',
    location: { lat: 28.6139, lng: 77.2090 },
    aqi: 158,
    name: 'Central Park Sensor',
  },
  {
    id: 'AQI-02',
    location: { lat: 28.5800, lng: 77.2100 },
    aqi: 95,
    name: 'South Delhi Sensor',
  },
  {
    id: 'AQI-03',
    location: { lat: 28.6562, lng: 77.2410 },
    aqi: 210,
    name: 'Old Delhi Sensor',
  },
];

export const reportCategories = Object.values(ReportCategory);
