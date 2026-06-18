export interface Organization {
  id: string;
  name: string;
  description: string;
  target: number;
  currency: string;
  createdAt: string;
}

export interface Member {
  id: string;
  name: string;
  phone: string;
  yearOfStudy: number;
  target: number;
  paid: number;
  createdAt: string;
}

export type MemberStatus = "complete" | "incomplete" | "not_started";

export interface Transaction {
  id: string;
  memberId: string | null;
  memberName: string | null;
  type: "income" | "expense" | "transfer";
  amount: number;
  category: string;
  description: string;
  date: string;
  recordedBy: string;
}

export interface DailyCollection {
  id: string;
  memberId: string;
  memberName: string;
  amount: number;
  date: string;
}

export type TransactionType = "income" | "expense" | "transfer";

export interface User {
  username: string;
  role: "admin" | "staff" | "viewer";
  organizationId: string;
}

export interface AppData {
  organization: Organization;
  members: Member[];
  transactions: Transaction[];
  collections: DailyCollection[];
}
