import type { Report, AqiSensor, Citizen, Admin } from './types';
import { ReportCategory, ReportStatus, AdminRole } from './types';

export const mockCitizens: Citizen[] = [
    {
        id: 'user-001',
        janId: 'JAN-C-2024-0001',
        name: 'Amit Kumar',
        email: 'amit.kumar@example.com',
        phone: '9876543210',
        dateJoined: '2024-07-01T10:00:00Z',
        dob: '1990-05-15',
        address: '123, MG Road',
        city: 'New Delhi',
        state: 'Delhi'
    },
    {
        id: 'user-002',
        janId: 'JAN-C-2024-0002',
        name: 'Priya Sharma',
        email: 'priya.sharma@example.com',
        phone: '9876543211',
        dateJoined: '2024-07-05T11:30:00Z',
        dob: '1992-08-22',
        address: '456, GK-1',
        city: 'New Delhi',
        state: 'Delhi'
    }
];

export const mockAdmins: Admin[] = [
    {
        id: 'admin-001',
        janId: 'JAN-K-2005-0001',
        email: 'super.admin@jancorp.com',
        name: 'Municipal Head',
        role: AdminRole.SuperAdmin,
        dateJoined: '2024-01-01T09:00:00Z',
    },
    {
        id: 'admin-002',
        janId: 'JAN-A-2024-0001',
        email: 'waste.admin@jancorp.com',
        name: 'Waste Dept Head',
        role: AdminRole.DepartmentAdmin,
        department: ReportCategory.Waste,
        dateJoined: '2024-02-15T09:00:00Z',
    },
    {
        id: 'admin-003',
        janId: 'JAN-A-2024-0002',
        email: 'pothole.admin@jancorp.com',
        name: 'Pothole Dept Head',
        role: AdminRole.DepartmentAdmin,
        department: ReportCategory.Pothole,
        dateJoined: '2024-02-15T09:00:00Z',
    },
    {
        id: 'admin-004',
        janId: 'JAN-A-2024-0003',
        email: 'streetlight.admin@jancorp.com',
        name: 'Streetlight Dept Head',
        role: AdminRole.DepartmentAdmin,
        department: ReportCategory.Streetlight,
        dateJoined: '2024-02-15T09:00:00Z',
    },
];

export const mockReports: Report[] = [
  {
    id: 'RPT-001',
    citizenId: 'user-001',
    category: ReportCategory.Waste,
    description: 'Large pile of garbage overflowing from the public bin. It has been there for 3 days.',
    latitude: 28.6139,
    longitude: 77.2090,
    imageUrl: 'https://picsum.photos/seed/1/400/300',
    reportDate: new Date('2024-07-18T08:00:00Z').toISOString(),
    status: ReportStatus.Pending,
    assignedAdminName: 'Unassigned',
  },
  {
    id: 'RPT-002',
    citizenId: 'user-002',
    category: ReportCategory.Pothole,
    description: 'Deep pothole on the main road causing traffic issues. Very dangerous for two-wheelers.',
    latitude: 28.5800,
    longitude: 77.2100,
    imageUrl: 'https://picsum.photos/seed/2/400/300',
    reportDate: new Date('2024-07-17T14:30:00Z').toISOString(),
    status: ReportStatus.InProgress,
    assignedAdminId: 'admin-003',
    assignedAdminName: 'Pothole Dept Head',
  },
  {
    id: 'RPT-003',
    citizenId: 'user-001',
    category: ReportCategory.Streetlight,
    description: 'The streetlight at the corner of the street is not working. It is very dark at night.',
    latitude: 28.6315,
    longitude: 77.2167,
    imageUrl: '',
    reportDate: new Date('2024-07-15T20:00:00Z').toISOString(),
    status: ReportStatus.Resolved,
    assignedAdminId: 'admin-004',
    assignedAdminName: 'Streetlight Dept Head',
  },
  {
    id: 'RPT-004',
    citizenId: 'user-002',
    category: ReportCategory.Water,
    description: 'Severe water logging after the rain yesterday. The road is completely submerged.',
    latitude: 28.6562,
    longitude: 77.2410,
    imageUrl: 'https://picsum.photos/seed/4/400/300',
    reportDate: new Date('2024-07-19T09:15:00Z').toISOString(),
    status: ReportStatus.Pending,
    assignedAdminName: 'Unassigned',
  },
  {
    id: 'RPT-005',
    citizenId: 'user-001',
    category: ReportCategory.Other,
    description: 'Broken public bench in the park. Needs immediate repair.',
    latitude: 28.6129,
    longitude: 77.2295,
    imageUrl: '',
    reportDate: new Date('2024-07-10T11:00:00Z').toISOString(),
    status: ReportStatus.Resolved,
    assignedAdminId: 'admin-002', // Assume waste handles it
    assignedAdminName: 'Waste Dept Head',
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
