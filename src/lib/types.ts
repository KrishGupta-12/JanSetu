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
  PendingApproval = 'Pending Approval', // New status for after admin submission
  PendingCitizenFeedback = 'Pending Citizen Feedback', // New status
}

export type ReportUrgency = 'Low' | 'Medium' | 'High' | 'Critical';

export type Resolution = {
  adminId: string;
  adminName: string;
  date: string; // ISO string
  summary: string;
  cost: number;
  costBreakdown: string;
  afterImageUrl?: string;
  citizenFeedback?: string;
  citizenRating?: number; // e.g., 1-5
  superAdminFeedback?: string;
  superAdminRating?: number; // e.g., 1-5
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
  reportDate: string; // ISO string
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
  janId: string;
  name: string;
  email: string;
  phone: string;
  dateJoined: string; // ISO string
  dob?: string; // yyyy-mm-dd
  address?: string;
  city?: string;
  state?: string;
  bannedUntil?: string | 'lifetime' | null; // ISO string, 'lifetime', or null
  role?: AdminRole;
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
    role: undefined;
}


// A generic user type for the auth context
export type User = UserProfile;