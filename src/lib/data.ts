
import type { Report, AqiSensor, Citizen } from './types';
import { ReportCategory, ReportStatus, AdminRole } from './types';

export const mockCitizens: Citizen[] = [
    {
        uid: 'user-001',
        name: 'Amit Kumar',
        email: 'amit.kumar@example.com',
        phone: '9876543210',
        dateJoined: '2024-07-01T10:00:00Z',
        dob: '1990-05-15',
        address: 'House No. 123, Sector 17',
        city: 'Chandigarh',
        state: 'Chandigarh',
        role: null,
    },
    {
        uid: 'user-002',
        name: 'Priya Sharma',
        email: 'priya.sharma@example.com',
        phone: '9876543211',
        dateJoined: '2024-07-05T11:30:00Z',
        dob: '1992-08-22',
        address: 'House No. 456, Sector 22',
        city: 'Chandigarh',
        state: 'Chandigarh',
        role: null,
    },
    {
        uid: 'user-003',
        name: 'Sandeep Singh',
        email: 'sandeep.singh@example.com',
        phone: '9123456780',
        dateJoined: '2024-06-15T09:00:00Z',
        dob: '1988-11-01',
        address: 'House No. 789, Sector 35',
        city: 'Chandigarh',
        state: 'Chandigarh',
        bannedUntil: '2025-01-01T00:00:00Z',
        role: null,
    },
    {
        uid: 'user-004',
        name: 'Anjali Gupta',
        email: 'anjali.gupta@example.com',
        phone: '9988776655',
        dateJoined: '2024-07-10T15:20:00Z',
        dob: '1995-02-10',
        address: 'House No. 101, Sector 8',
        city: 'Chandigarh',
        state: 'Chandigarh',
        role: null,
    },
    {
        uid: 'user-005',
        name: 'Rahul Verma',
        email: 'rahul.verma@example.com',
        phone: '9001223344',
        dateJoined: '2024-05-20T18:00:00Z',
        dob: '1991-07-19',
        address: 'House No. 212, Sector 45',
        city: 'Chandigarh',
        state: 'Chandigarh',
        bannedUntil: 'lifetime',
        role: null,
    },
    {
        uid: 'user-006',
        name: 'Sneha Reddy',
        email: 'sneha.reddy@example.com',
        phone: '9555666777',
        dateJoined: '2024-07-12T12:00:00Z',
        dob: '1993-09-05',
        address: 'House No. 333, Sector 9',
        city: 'Chandigarh',
        state: 'Chandigarh',
        role: null,
    },
    {
        uid: 'user-007',
        name: 'Vikas Mehra',
        email: 'vikas.mehra@example.com',
        phone: '9444333222',
        dateJoined: '2024-07-18T10:30:00Z',
        dob: '1985-03-30',
        address: 'House No. 555, Sector 11',
        city: 'Chandigarh',
        state: 'Chandigarh',
        role: null,
    },
    {
        uid: 'user-008',
        name: 'Pooja Desai',
        email: 'pooja.desai@example.com',
        phone: '9666777888',
        dateJoined: '2024-07-20T11:00:00Z',
        dob: '1996-12-12',
        address: 'House No. 888, Sector 15',
        city: 'Chandigarh',
        state: 'Chandigarh',
        role: null,
    }
];

export const mockAqiSensors: AqiSensor[] = [
  {
    id: 'AQI-01',
    location: { lat: 30.7333, lng: 76.7794 }, // Sector 17
    aqi: 158,
    name: 'Central Chandigarh Sensor',
  },
  {
    id: 'AQI-02',
    location: { lat: 30.7179, lng: 76.7448 }, // Sector 43
    aqi: 95,
    name: 'South Chandigarh Sensor',
  },
  {
    id: 'AQI-03',
    location: { lat: 30.7526, lng: 76.8099 }, // Rock Garden
    aqi: 210,
    name: 'North Chandigarh Sensor',
  },
  {
    id: 'AQI-04',
    location: { lat: 30.7410, lng: 76.7900 }, // Panjab University
    aqi: 180,
    name: 'West Chandigarh Sensor',
  },
  {
    id: 'AQI-05',
    location: { lat: 30.7056, lng: 76.7997 }, // Elante Mall
    aqi: 165,
    name: 'Industrial Area Sensor',
  },
  {
    id: 'AQI-06',
    location: { lat: 30.7422, lng: 76.8188 }, // Sukhna Lake
    aqi: 120,
    name: 'East Chandigarh Sensor',
  },
];

export const reportCategories = Object.values(ReportCategory);
