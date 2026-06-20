export interface Organization {
  id: number;
  name: string;
  slug: string;
  description: string;
  category: string;
  subscription_status: string;
  subscription_expires_at: string | null;
  trial_started_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  theme?: OrganizationTheme;
  user_role: string;
}

export interface OrganizationTheme {
  primary_color: string;
  secondary_color: string;
  success_color: string;
  warning_color: string;
  danger_color: string;
  navbar_title: string;
  footer_text: string;
  watermark_text: string;
  default_pledge_amount: string;
  target_amount: string;
  logo_url: string | null;
}

export interface Member {
  id: number;
  name: string;
  pledge: number | string;
  paid_total: number | string;
  remaining: number | string;
  phone: string | null;
  email: string | null;
  course: string | null;
  year: string | null;
  is_active: boolean;
  status_display: string;
  is_complete: boolean;
  is_incomplete: boolean;
  not_started: boolean;
  has_exceeded: boolean;
  created_at: string;
  updated_at: string;
}

export type MemberStatus = "complete" | "incomplete" | "not_started" | "exceeded";

export interface Transaction {
  id: number;
  member: number | null;
  member_name: string | null;
  amount: string;
  date: string;
  note: string | null;
  added_by: number;
  added_by_username: string;
  created_at: string;
  updated_at: string;
}

export interface DailyCollection {
  id: string;
  memberId: string;
  memberName: string;
  amount: number;
  date: string;
}

export type TransactionType = "income" | "expense";

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  needs_onboarding: boolean;
  onboarding_completed: boolean;
}

export interface DashboardStats {
  total_collected: string;
  total_pledged: string;
  target_amount: string;
  progress_percentage: number;
  member_count: number;
  not_paid_count: number;
  incomplete_count: number;
  complete_count: number;
  exceeded_count: number;
}

export interface AppData {
  organization: Organization;
  members: Member[];
  transactions: Transaction[];
  collections: DailyCollection[];
  dashboardStats: DashboardStats;
}
