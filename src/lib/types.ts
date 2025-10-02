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
  category: ReportCategory;
  description: string;
  location: {
    lat: number;
    lng: number;
  };
  address: string;
  photoUrl?: string;
  status: ReportStatus;
  createdAt: Date;
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
