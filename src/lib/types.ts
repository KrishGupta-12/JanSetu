export enum ReportCategory {
  Waste = 'Waste Management',
  Pothole = 'Potholes',
  Streetlight = 'Streetlight Outage',
  Water = 'Water Logging',
  Other = 'Other',
}

export enum ReportStatus {
  Pending = 'Pending',
  InProgress = 'In Progress',
  Resolved = 'Resolved',
}

export type Report = {
  id: string;
  citizenId: string;
  category: ReportCategory;
  description: string;
  latitude: number;
  longitude: number;
  imageUrl: string;
  reportDate: string; // ISO string
  status: ReportStatus;
};

export type AqiSensor = {
  id: string;
  location: {
    lat: number;
    lng: number;
  };
  aqi: number;
  name: string;
};

export type Citizen = {
    id: string;
    name: string;
    email: string;
    phone: string;
    dateJoined: string; // ISO string
    dob?: string; // yyyy-mm-dd
    address?: string;
    city?: string;
    state?: string;
}
