
export enum UserRole {
  USER = 'user',
  RESELLER = 'reseller',
  ADMIN = 'admin',
  SUB_RESELLER = 'sub_reseller'
}

export interface ReportPreferences {
  dailyReportEmail: string;
  receiveDaily: boolean;
  receiveWeekly: boolean;
  receiveMonthly: boolean;
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  deviceId?: string;
  points?: number;
  isActive: boolean;
  requiresVerification?: boolean;
  created_at?: string;
  // Reseller specific fields
  name?: string;
  phone?: string;
  notes?: string;
  expirationDate?: string;
  maxDevices?: number;
  activeDevicesCount?: number;
  reseller_id?: string;
  reportPreferences?: ReportPreferences; // New field for personal report preferences
}

export interface Distributor extends User {
    totalUsers: number;
    totalSpent: number;
    status: 'Active' | 'Suspended';
    lastLogin: string;
}

export interface ActivationCode {
  id: string;
  code: string;
  status: 'Active' | 'Not Activated' | 'Expired' | 'Suspended';
  durationMonths: number;
  maxDevices: number;
  currentDevices: number;
  assignedUser?: string; // name or email
  distributorId?: string; // Who generated it
  createdDate: string;
  expirationDate?: string;
  notes?: string;
}

export interface Transaction {
  id: string;
  type: 'Purchase' | 'Deduction' | 'Refund' | 'Allocation';
  amount: number; // Points
  description: string;
  date: string;
  status: 'Completed' | 'Pending' | 'Failed';
  userId?: string;
}

export interface PointTransaction {
  id: string;
  distributorName: string;
  type: 'Buy' | 'Deduct' | 'Adjust' | 'Bonus';
  amount: number;
  adminApprover?: string;
  date: string;
  description?: string;
}

export interface PaymentRecord {
  id: string;
  distributorName: string;
  method: 'Stripe' | 'PayMob' | 'Fawry' | 'Manual';
  amount: number;
  currency: string;
  status: 'Completed' | 'Pending' | 'Failed' | 'Refunded';
  date: string;
  invoiceUrl?: string;
}

export interface Ticket {
  id: string;
  distributorName?: string;
  subject: string;
  status: 'Open' | 'Closed' | 'In Progress';
  priority: 'Low' | 'Medium' | 'High';
  lastUpdate: string;
  messages: { sender: string; text: string; date: string; isInternal?: boolean }[];
  internalNotes?: string;
}

export interface Device {
  id: string;
  deviceId: string;
  userId: string;
  userName: string;
  platform: string; // Samsung, LG, Android
  appVersion: string;
  lastLogin: string;
  ip: string;
  status: 'Active' | 'Blocked';
}

export interface ResellerNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  date: string;
  read: boolean;
}

export interface SubAccount {
  id: string;
  name: string;
  username: string;
  role: string;
  permissions: string[];
  lastLogin: string;
  status: 'Active' | 'Disabled';
}

export interface ResellerStats {
  totalUsers: number;
  activeUsers: number;
  expiredUsers: number;
  pointsBalance: number;
  codesActivatedToday: number;
  monthlySales: { name: string; sales: number }[];
}

export interface Channel {
  id: string;
  name: string;
  category: string;
  url: string;
  logo: string;
}

export interface Playlist {
  id: string;
  name: string;
  created_at?: string;
  itemCount?: number;
}

export interface PlaylistItem {
  id: string;
  title: string;
  url: string;
  category: string;
  logo_url?: string;
}

export interface PaymentPlan {
  id: string;
  name: string;
  durationMonths: number;
  points: number;
  maxDevices: number;
  isActive: boolean;
}

export interface SubscriptionCosts {
  month1: number;
  month3: number;
  month6: number;
  month12: number;
  costPerExtraDevice: number;
}

export interface AdminSettings {
  pointPriceCents: number;
  pointsPerUser: number; // Legacy field, keeping for compatibility
  subscriptionCosts: SubscriptionCosts; // New granular control
  allowMultiDevice: boolean;
  defaultDeviceLimit: number;
  maintenanceMode: boolean;
  minAppVersion: string;
  tokenExpirationHours: number;
}

export interface AdminNotification {
  id: string;
  target: 'All Distributors' | 'Specific Distributor' | 'All Users';
  type: 'Alert' | 'Warning' | 'Promotion';
  title: string;
  message: string;
  sentAt: string;
  sentBy: string;
}

export interface AuditLog {
  id: string;
  action: string;
  actor: string; // Admin or User who performed the action
  target: string; // Affected entity
  ip: string;
  timestamp: string;
  details: string;
}

export interface AdminRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  usersCount: number;
}

export interface FinancialRecord {
  id: string;
  transactionId: string;
  type: 'Credit' | 'Debit' | 'Commission' | 'Payout';
  amount: number;
  currency: string;
  gateway: 'Stripe' | 'PayMob' | 'Fawry' | 'Bank Transfer' | 'System';
  distributorName?: string;
  country?: string;
  date: string;
  status: 'Verified' | 'Pending';
  ledgerHash: string; // Immutable Hash
  previousHash: string;
}