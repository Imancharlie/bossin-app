import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { AppData, DailyCollection, Member, Organization, Transaction, DashboardStats } from "@/types";
import { apiClient, ApiResponse } from "@/services/apiClient";
import { useAuth } from "./AuthContext";

const DATA_KEY = "@bossin_data";
const ORG_SLUG_KEY = "@bossin_org_slug";
const THEME_KEY = "@bossin_theme";

const SEED_DATA: AppData = {
  organization: {
    id: 1,
    name: "My Organization",
    slug: "my-org",
    description: "Organization description",
    category: "organization",
    subscription_status: "SUBSCRIBED",
    subscription_expires_at: null,
    trial_started_at: null,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user_role: "owner",
  },
  members: [],
  transactions: [],
  collections: [],
  dashboardStats: {
    total_collected: "0",
    total_pledged: "0",
    target_amount: "0",
    progress_percentage: 0,
    member_count: 0,
    not_paid_count: 0,
    incomplete_count: 0,
    complete_count: 0,
    exceeded_count: 0,
  },
};

interface DataContextType {
  data: AppData;
  isLoading: boolean;
  themeLoading: boolean;
  addMember: (member: Omit<Member, "id" | "paid_total" | "remaining" | "created_at" | "updated_at">) => Promise<void>;
  updateMember: (id: number, updates: Partial<Member>) => Promise<void>;
  deleteMember: (id: number) => Promise<void>;
  addTransaction: (tx: Omit<Transaction, "id" | "created_at" | "updated_at">) => Promise<void>;
  deleteTransaction: (id: number) => Promise<void>;
  recordCollection: (collection: Omit<DailyCollection, "id">) => Promise<void>;
  updateOrganization: (updates: Partial<Organization>) => Promise<void>;
  refreshData: () => Promise<void>;
  totalCollected: number;
  totalExpenses: number;
  progress: number;
  completeCount: number;
  incompleteCount: number;
  notStartedCount: number;
  todayCollected: number;
}

const DataContext = createContext<DataContextType>({} as DataContextType);

function computeStats(data: AppData) {
  const today = new Date().toISOString().split("T")[0];
  const totalCollected = data.members.reduce((s, m) => s + parseFloat(m.paid_total || "0"), 0);
  const totalExpenses = 0; // Backend doesn't have expenses
  const progress = data.dashboardStats?.progress_percentage || 0;
  const completeCount = data.dashboardStats?.complete_count || 0;
  const incompleteCount = data.dashboardStats?.incomplete_count || 0;
  const notStartedCount = data.dashboardStats?.not_paid_count || 0;
  const todayCollected = data.transactions
    .filter((t) => t.date === today)
    .reduce((s, t) => s + parseFloat(t.amount || "0"), 0);
  return { totalCollected, totalExpenses, progress, completeCount, incompleteCount, notStartedCount, todayCollected };
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(SEED_DATA);
  const [isLoading, setIsLoading] = useState(true);
  const [themeLoading, setThemeLoading] = useState(true);
  const { user } = useAuth();

  // Load cached theme on mount to prevent flickering
  useEffect(() => {
    const loadCachedTheme = async () => {
      try {
        const cachedTheme = await AsyncStorage.getItem(THEME_KEY);
        if (cachedTheme) {
          const theme = JSON.parse(cachedTheme);
          setData((prev: AppData) => ({
            ...prev,
            organization: {
              ...prev.organization,
              theme
            }
          }));
        }
      } catch (error) {
        console.error('[DataContext] Error loading cached theme:', error);
      } finally {
        setThemeLoading(false);
      }
    };
    loadCachedTheme();
  }, []);

  const refreshData = useCallback(async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      // Get organization slug from storage or user's default org
      const orgSlug = await AsyncStorage.getItem(ORG_SLUG_KEY);
      if (!orgSlug) {
        console.error('[DataContext] No organization slug found in storage');
        return;
      }

      console.log('[DataContext] Fetching data for org:', orgSlug);
      console.log('[DataContext] Full URL for members:', `https://bossin.kodin.co.tz/api/v1/orgs/${orgSlug}/members/`);

      // Fetch organization details
      const orgResponse: ApiResponse<Organization> = await apiClient.get(`/orgs/${orgSlug}/`);
      console.log('[DataContext] Organization response:', orgResponse);
      
      // Fetch dashboard stats
      const statsResponse: ApiResponse<DashboardStats> = await apiClient.get(`/orgs/${orgSlug}/dashboard/stats/`);
      console.log('[DataContext] Dashboard stats response:', statsResponse);
      
      // Fetch members with pagination
      let allMembers: any[] = [];
      let nextPage = `/orgs/${orgSlug}/members/`;
      let pageCount = 0;

      while (nextPage && pageCount < 10) { // Safety limit of 10 pages
        console.log('[DataContext] Fetching page:', nextPage);
        const membersResponse: any = await apiClient.get(nextPage);
        console.log('[DataContext] Raw members response:', JSON.stringify(membersResponse, null, 2));
        console.log('[DataContext] Members response keys:', Object.keys(membersResponse));

        // The API returns: { count, next, previous, results: { success, data: [...] } }
        // apiClient might wrap this in { success, data, error }
        let membersData: any[] = [];

        if (membersResponse.results?.data) {
          // Paginated response with results.data
          membersData = membersResponse.results.data;
          nextPage = membersResponse.next ? membersResponse.next.replace('https://bossin.kodin.co.tz/api/v1', '') : null;
        } else if (membersResponse.data?.results?.data) {
          // apiClient wrapped the paginated response
          membersData = membersResponse.data.results.data;
          nextPage = membersResponse.data.next ? membersResponse.data.next.replace('https://bossin.kodin.co.tz/api/v1', '') : null;
        } else if (membersResponse.data) {
          // Direct array response
          membersData = Array.isArray(membersResponse.data) ? membersResponse.data : [];
          nextPage = null;
        } else {
          console.error('[DataContext] Unknown response structure:', membersResponse);
          nextPage = null;
        }

        console.log('[DataContext] Extracted members data length:', membersData.length);
        allMembers = [...allMembers, ...membersData];
        pageCount++;
        console.log('[DataContext] Fetched page', pageCount, 'total members so far:', allMembers.length);
      }

      console.log('[DataContext] Total members fetched:', allMembers.length);

      // Normalize member data - convert numeric fields to strings for display
      const normalizedMembers = allMembers.map((m: any) => ({
        ...m,
        pledge: typeof m.pledge === 'number' ? m.pledge.toString() : m.pledge,
        paid_total: typeof m.paid_total === 'number' ? m.paid_total.toString() : m.paid_total,
        remaining: typeof m.remaining === 'number' ? m.remaining.toString() : m.remaining,
      }));

      // Fetch transactions
      const transactionsResponse: any = await apiClient.get(`/orgs/${orgSlug}/transactions/`);
      console.log('[DataContext] Transactions response:', JSON.stringify(transactionsResponse, null, 2));
      
      // Handle different response structures
      let transactionsData: any[] = [];
      if (transactionsResponse.data?.results?.data) {
        // Paginated response with results.data
        transactionsData = transactionsResponse.data.results.data;
      } else if (transactionsResponse.results?.data) {
        // Paginated response with results.data
        transactionsData = transactionsResponse.results.data;
      } else if (Array.isArray(transactionsResponse.data)) {
        // Direct array response
        transactionsData = transactionsResponse.data;
      } else if (Array.isArray(transactionsResponse)) {
        // Direct array response (no wrapper)
        transactionsData = transactionsResponse;
      }
      
      console.log('[DataContext] Extracted transactions count:', transactionsData.length);

      const newData: AppData = {
        organization: orgResponse.data || SEED_DATA.organization,
        members: normalizedMembers,
        transactions: transactionsData,
        collections: [],
        dashboardStats: statsResponse.data || SEED_DATA.dashboardStats,
      };

      setData(newData);
      await AsyncStorage.setItem(DATA_KEY, JSON.stringify(newData));
      
      // Cache theme separately for quick loading
      if (newData.organization?.theme) {
        await AsyncStorage.setItem(THEME_KEY, JSON.stringify(newData.organization.theme));
      }
      
      console.log('[DataContext] Data refreshed successfully');
    } catch (error) {
      console.error('[DataContext] Error fetching data:', error);
      // Try to load from cache if API fails
      const cached = await AsyncStorage.getItem(DATA_KEY);
      if (cached) {
        console.log('[DataContext] Loading from cache due to API error');
        setData(JSON.parse(cached));
      } else {
        console.log('[DataContext] No cache available, using seed data');
        setData(SEED_DATA);
      }
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      refreshData();
    } else {
      // Load from cache if no user
      AsyncStorage.getItem(DATA_KEY).then((cached) => {
        if (cached) {
          console.log('[DataContext] Loading cached data (no user)');
          setData(JSON.parse(cached));
        } else {
          console.log('[DataContext] No cached data, using seed data');
          setData(SEED_DATA);
        }
        setIsLoading(false); // Set loading to false when no user
      });
    }
  }, [user, refreshData]);

  const addMember = async (member: Omit<Member, "id" | "paid_total" | "remaining" | "created_at" | "updated_at">) => {
    const orgSlug = await AsyncStorage.getItem(ORG_SLUG_KEY);
    if (!orgSlug) {
      console.error('[DataContext] No organization slug when adding member');
      throw new Error('Organization not found');
    }

    try {
      // Only send required/optional fields according to API docs
      const memberData = {
        name: member.name,
        pledge: typeof member.pledge === 'number' ? member.pledge : parseFloat(member.pledge),
        phone: member.phone,
        email: member.email,
        course: member.course,
        year: member.year,
      };
      console.log('[DataContext] Adding member:', memberData);
      const response: ApiResponse<Member> = await apiClient.post(`/orgs/${orgSlug}/members/`, memberData);
      console.log('[DataContext] Add member response:', response);
      if (response.data) {
        const newData = { ...data, members: [...data.members, response.data] };
        setData(newData);
        await AsyncStorage.setItem(DATA_KEY, JSON.stringify(newData));
      }
    } catch (error) {
      console.error('[DataContext] Error adding member:', error);
      throw error;
    }
  };

  const updateMember = async (id: number, updates: Partial<Member>) => {
    const orgSlug = await AsyncStorage.getItem(ORG_SLUG_KEY);
    if (!orgSlug) return;

    try {
      // Only send allowed fields according to API docs
      const memberData = {
        name: updates.name,
        pledge: updates.pledge,
        phone: updates.phone,
        email: updates.email,
        course: updates.course,
        year: updates.year,
      };
      const response: ApiResponse<Member> = await apiClient.patch(`/orgs/${orgSlug}/members/${id}/`, memberData);
      if (response.data) {
        const newData = { ...data, members: data.members.map((m) => m.id === id ? response.data : m) };
        setData(newData);
        await AsyncStorage.setItem(DATA_KEY, JSON.stringify(newData));
      }
    } catch (error) {
      console.error('Error updating member:', error);
      throw error;
    }
  };

  const deleteMember = async (id: number) => {
    const orgSlug = await AsyncStorage.getItem(ORG_SLUG_KEY);
    if (!orgSlug) return;

    try {
      await apiClient.delete(`/orgs/${orgSlug}/members/${id}/`);
      const newData = {
        ...data,
        members: data.members.filter((m) => m.id !== id),
        transactions: data.transactions.filter((t) => t.member !== id),
      };
      setData(newData);
      await AsyncStorage.setItem(DATA_KEY, JSON.stringify(newData));
    } catch (error) {
      console.error('Error deleting member:', error);
      throw error;
    }
  };

  const addTransaction = async (tx: { memberId: number; amount: string | number; date: string; note?: string }) => {
    const orgSlug = await AsyncStorage.getItem(ORG_SLUG_KEY);
    if (!orgSlug) {
      console.error('[DataContext] No organization slug when adding transaction');
      throw new Error('Organization not found');
    }

    // API only supports member-specific transactions
    if (!tx.memberId) {
      console.error('[DataContext] Transaction must be associated with a member');
      throw new Error('Transaction must be associated with a member');
    }

    try {
      // Only send allowed fields according to backend model
      const txData = {
        amount: typeof tx.amount === 'number' ? tx.amount : parseFloat(tx.amount),
        date: tx.date,
        note: tx.note || '',
      };
      console.log('[DataContext] Adding transaction for member:', tx.memberId, txData);

      // Use member-specific endpoint
      const response: any = await apiClient.post(`/orgs/${orgSlug}/members/${tx.memberId}/transactions/`, txData);
      console.log('[DataContext] Add transaction response:', response);

      if (response.data) {
        const transaction = response.data.transaction;
        const member = response.data.member;

        const newData = {
          ...data,
          transactions: [transaction, ...data.transactions],
          members: member ? data.members.map((m) => m.id === member.id ? member : m) : data.members,
        };
        setData(newData);
        await AsyncStorage.setItem(DATA_KEY, JSON.stringify(newData));
      }
    } catch (error) {
      console.error('[DataContext] Error adding transaction:', error);
      throw error;
    }
  };

  const deleteTransaction = async (id: number) => {
    const orgSlug = await AsyncStorage.getItem(ORG_SLUG_KEY);
    if (!orgSlug) return;

    try {
      await apiClient.delete(`/orgs/${orgSlug}/transactions/${id}/`);
      const newData = {
        ...data,
        transactions: data.transactions.filter((t) => t.id !== id),
      };
      setData(newData);
      await AsyncStorage.setItem(DATA_KEY, JSON.stringify(newData));
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  };

  const recordCollection = async (collection: Omit<DailyCollection, "id">) => {
    const orgSlug = await AsyncStorage.getItem(ORG_SLUG_KEY);
    if (!orgSlug) return;

    try {
      // Use member transactions endpoint for recording payments
      const txData = {
        amount: collection.amount.toString(),
        date: collection.date,
        note: "Daily collection payment",
      };
      const response: ApiResponse<{ transaction: Transaction; member: Member }> = await apiClient.post(`/orgs/${orgSlug}/members/${parseInt(collection.memberId)}/transactions/`, txData);
      if (response.data) {
        const newData = {
          ...data,
          transactions: [response.data.transaction, ...data.transactions],
          members: data.members.map((m) => m.id === response.data.member.id ? response.data.member : m),
        };
        setData(newData);
        await AsyncStorage.setItem(DATA_KEY, JSON.stringify(newData));
      }
    } catch (error) {
      console.error('Error recording collection:', error);
      throw error;
    }
  };

  const updateOrganization = async (updates: Partial<Organization>) => {
    const orgSlug = await AsyncStorage.getItem(ORG_SLUG_KEY);
    if (!orgSlug) return;

    try {
      const response: ApiResponse<Organization> = await apiClient.patch(`/orgs/${orgSlug}/`, updates);
      if (response.data) {
        const newData = { ...data, organization: response.data };
        setData(newData);
        await AsyncStorage.setItem(DATA_KEY, JSON.stringify(newData));
      }
    } catch (error) {
      console.error('Error updating organization:', error);
      throw error;
    }
  };

  // Helper function to manually set organization slug (for debugging)
  const setOrganizationSlug = async (slug: string) => {
    await AsyncStorage.setItem(ORG_SLUG_KEY, slug);
    console.log('[DataContext] Organization slug manually set to:', slug);
    await refreshData();
  };

  const stats = computeStats(data);

  return (
    <DataContext.Provider value={{
      data, isLoading, themeLoading, addMember, updateMember, deleteMember,
      addTransaction, deleteTransaction, recordCollection, updateOrganization, refreshData,
      setOrganizationSlug,
      ...stats,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);
