
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
  complainantName: string;
  complainantPhone: string;
  locationAddress: string;
  category: ReportCategory;
  description: string;
  imageUrl?: string;
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
  name: string;
  email: string;
  phone: string;
  dateJoined: string; 
  address: string;
  city?: string;
  state?: string;
  bannedUntil?: string | 'lifetime' | null; 
  role: UserRole;
  department?: ReportCategory;
  totalReports: number;
  resolvedReports: number;
};


export enum UserRole {
    SuperAdmin = 'super_admin',
    WasteAdmin = 'waste_admin',
    PotholeAdmin = 'pothole_admin',
    StreetlightAdmin = 'streetlight_admin',
    WaterAdmin = 'water_admin',
    Citizen = 'citizen',
}

export const DepartmentAdminRoles: UserRole[] = [
  UserRole.WasteAdmin,
  UserRole.PotholeAdmin,
  UserRole.StreetlightAdmin,
  UserRole.WaterAdmin
];

export const AllAdminRoles: UserRole[] = [
  UserRole.SuperAdmin,
  ...DepartmentAdminRoles
];

export type AdminCredential = {
    role: UserRole;
    department?: ReportCategory;
}


export type Admin = UserProfile & {
    role: Exclude<UserRole, UserRole.Citizen>;
};

export type Citizen = UserProfile & {
    role: UserRole.Citizen;
}

export type AlertLevel = 'Info' | 'Warning' | 'Critical';

export type Alert = {
  id: string;
  title: string;
  description: string;
  level: AlertLevel;
  publishDate: string;
  adminId: string;
  adminName: string;
};

export type LeaderboardEntry = {
  uid: string;
  name: string;
  score: number;
  totalReports: number;
  resolvedReports: number;
};

export type LeaderboardDocument = {
    users: LeaderboardEntry[];
    lastUpdated: string;
}
