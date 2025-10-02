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
  Rejected = 'Rejected',
  PendingApproval = 'Pending Approval',
  PendingCitizenFeedback = 'Pending Citizen Feedback',
}

export type ReportUrgency = 'Low' | 'Medium' | 'High' | 'Critical';

export type Resolution = {
  adminId: string;
  adminName: string;
  date: string; 
  summary: string;
  cost: number;
  costBreakdown: string;
  afterImageUrl?: string;
  citizenFeedback?: string;
  citizenRating?: number; 
  superAdminFeedback?: string;
  superAdminRating?: number; 
  isApproved?: boolean;
};

export type Report = {
  id: string;
  citizenId: string;
  category: ReportCategory;
  description: string;
  latitude: number;
  longitude: number;
  imageUrl: string;
  reportDate: string; 
  status: ReportStatus;
  urgency?: ReportUrgency;
  assignedAdminId?: string;
  assignedAdminName?: string;
  resolution?: Resolution;
  upvotes: number;
  citizenIdsWhoUpvoted: string[];
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

export type UserProfile = {
  uid: string;
  janId?: string;
  name: string;
  email: string;
  phone?: string;
  dateJoined: string; 
  dob?: string; 
  address?: string;
  city?: string;
  state?: string;
  bannedUntil?: string | 'lifetime' | null; 
  role?: AdminRole | null;
  department?: ReportCategory;
};


export enum AdminRole {
    SuperAdmin = 'super_admin',
    DepartmentAdmin = 'department_admin'
}

export type Admin = UserProfile & {
    role: AdminRole;
};

export type Citizen = UserProfile & {
    role: null;
}
