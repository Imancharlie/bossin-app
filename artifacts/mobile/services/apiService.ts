import { apiClient, ApiResponse, PaginatedResponse, ApiError } from './apiClient';

// Type definitions based on API documentation
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  organization_name: string;
  organization_description?: string;
  accept_terms: boolean;
}

export interface Tokens {
  access: string;
  refresh: string;
}

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

export interface Organization {
  id: number;
  name: string;
  slug: string;
  description: string;
  category: string;
  subscription_status: string;
  subscription_expires_at: string;
  trial_started_at: string;
  is_active: boolean;
  created_at: string;
  theme: OrganizationTheme;
  subscription_info: SubscriptionInfo;
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

export interface SubscriptionInfo {
  subscription_status: string;
  is_active: boolean;
  trial_active: boolean;
  subscription_active: boolean;
  days_remaining: number;
  subscription_expires_at: string;
  trial_started_at: string;
}

export interface LoginResponse {
  tokens: Tokens;
  user: User;
  default_org: Organization;
  organizations: Organization[];
}

export interface Member {
  id: number;
  name: string;
  pledge: string;
  paid_total: string;
  remaining: string;
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

export interface Transaction {
  id: number;
  member: number;
  member_name: string;
  amount: string;
  date: string;
  note: string | null;
  added_by: number;
  added_by_username: string;
  created_at: string;
  updated_at: string;
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

export interface Staff {
  id: number;
  user: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    phone: string | null;
  };
  role: string;
  is_active: boolean;
  joined_at: string;
}

// Authentication Service
export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login/', credentials);
    if (!response.data) {
      throw new ApiError('Login failed');
    }
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/register/', data);
    if (!response.data) {
      throw new ApiError('Registration failed');
    }
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await apiClient.get<ApiResponse<{ user: User; organizations: Organization[]; memberships: any[] }>>('/auth/me/');
    return response.data;
  },

  refreshToken: async (refreshToken: string): Promise<{ tokens: Tokens }> => {
    const response = await apiClient.post<ApiResponse<{ tokens: Tokens }>>('/auth/refresh/', { refresh: refreshToken });
    if (!response.data) {
      throw new ApiError('Token refresh failed');
    }
    return response.data;
  },
};

// Organization Service
export const organizationService = {
  listOrganizations: async (): Promise<Organization[]> => {
    const response = await apiClient.get<ApiResponse<{ organizations: Organization[] }>>('/orgs/');
    return response.data?.organizations || [];
  },

  getOrganization: async (slug: string): Promise<Organization> => {
    const response = await apiClient.get<ApiResponse<Organization>>(`/orgs/${slug}/`);
    if (!response.data) {
      throw new ApiError('Organization not found');
    }
    return response.data;
  },

  getOrganizationTheme: async (slug: string): Promise<OrganizationTheme> => {
    const response = await apiClient.get<ApiResponse<OrganizationTheme>>(`/orgs/${slug}/theme/`);
    if (!response.data) {
      throw new ApiError('Theme not found');
    }
    return response.data;
  },

  updateOrganizationTheme: async (slug: string, data: Partial<OrganizationTheme>): Promise<OrganizationTheme> => {
    const response = await apiClient.patch<ApiResponse<OrganizationTheme>>(`/orgs/${slug}/theme/`, data);
    if (!response.data) {
      throw new ApiError('Theme update failed');
    }
    return response.data;
  },

  getDashboardStats: async (slug: string, search?: string, filter?: string): Promise<DashboardStats> => {
    const params: any = {};
    if (search) params.search = search;
    if (filter) params.filter = filter;
    const response = await apiClient.get<ApiResponse<DashboardStats>>(`/orgs/${slug}/dashboard/stats/`, params);
    if (!response.data) {
      throw new ApiError('Failed to fetch dashboard stats');
    }
    return response.data;
  },

  completeOnboarding: async (slug: string, email: string, phone?: string): Promise<{ user: User; message: string }> => {
    const response = await apiClient.post<ApiResponse<{ user: User; message: string }>>(`/orgs/${slug}/onboarding/`, { email, phone });
    if (!response.data) {
      throw new ApiError('Onboarding failed');
    }
    return response.data;
  },
};

// Member Service
export const memberService = {
  listMembers: async (slug: string, search?: string, filter?: string, page?: number): Promise<Member[]> => {
    const params: any = {};
    if (search) params.search = search;
    if (filter) params.filter = filter;
    if (page) params.page = page;
    const response = await apiClient.get<ApiResponse<Member[]>>(`/orgs/${slug}/members/`, params);
    return response.data || [];
  },

  getMember: async (slug: string, memberId: number): Promise<Member> => {
    const response = await apiClient.get<ApiResponse<Member>>(`/orgs/${slug}/members/${memberId}/`);
    if (!response.data) {
      throw new ApiError('Member not found');
    }
    return response.data;
  },

  createMember: async (slug: string, data: {
    name: string;
    pledge: number;
    phone?: string;
    email?: string;
    course?: string;
    year?: string;
  }): Promise<Member> => {
    const response = await apiClient.post<ApiResponse<Member>>(`/orgs/${slug}/members/`, data);
    if (!response.data) {
      throw new ApiError('Failed to create member');
    }
    return response.data;
  },

  updateMember: async (slug: string, memberId: number, data: Partial<Member>): Promise<Member> => {
    const response = await apiClient.patch<ApiResponse<Member>>(`/orgs/${slug}/members/${memberId}/`, data);
    if (!response.data) {
      throw new ApiError('Failed to update member');
    }
    return response.data;
  },

  deleteMember: async (slug: string, memberId: number): Promise<{ message: string }> => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/orgs/${slug}/members/${memberId}/`);
    if (!response.data) {
      throw new ApiError('Failed to delete member');
    }
    return response.data;
  },

  getMemberTransactions: async (slug: string, memberId: number): Promise<Transaction[]> => {
    const response = await apiClient.get<ApiResponse<Transaction[]>>(`/orgs/${slug}/members/${memberId}/transactions/`);
    return response.data || [];
  },

  recordPayment: async (slug: string, memberId: number, data: {
    amount: number;
    date?: string;
    note?: string;
  }): Promise<{ transaction: Transaction; member: Member }> => {
    const response = await apiClient.post<ApiResponse<{ transaction: Transaction; member: Member }>>(
      `/orgs/${slug}/members/${memberId}/transactions/`,
      data
    );
    if (!response.data) {
      throw new ApiError('Failed to record payment');
    }
    return response.data;
  },
};

// Transaction Service
export const transactionService = {
  listTransactions: async (
    slug: string,
    dateFrom?: string,
    dateTo?: string,
    memberId?: number,
    addedBy?: number,
    page?: number
  ): Promise<Transaction[]> => {
    const params: any = {};
    if (dateFrom) params.date_from = dateFrom;
    if (dateTo) params.date_to = dateTo;
    if (memberId) params.member_id = memberId;
    if (addedBy) params.added_by = addedBy;
    if (page) params.page = page;
    const response = await apiClient.get<ApiResponse<Transaction[]>>(`/orgs/${slug}/transactions/`, params);
    return response.data || [];
  },

  getTransaction: async (slug: string, transactionId: number): Promise<Transaction> => {
    const response = await apiClient.get<ApiResponse<Transaction>>(`/orgs/${slug}/transactions/${transactionId}/`);
    if (!response.data) {
      throw new ApiError('Transaction not found');
    }
    return response.data;
  },

  updateTransaction: async (slug: string, transactionId: number, data: {
    amount?: number;
    date?: string;
    note?: string;
  }): Promise<Transaction> => {
    const response = await apiClient.patch<ApiResponse<Transaction>>(`/orgs/${slug}/transactions/${transactionId}/`, data);
    if (!response.data) {
      throw new ApiError('Failed to update transaction');
    }
    return response.data;
  },

  deleteTransaction: async (slug: string, transactionId: number): Promise<{ message: string }> => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/orgs/${slug}/transactions/${transactionId}/`);
    if (!response.data) {
      throw new ApiError('Failed to delete transaction');
    }
    return response.data;
  },

  bulkPayment: async (slug: string, payments: Array<{
    member_id: number;
    payment_amount: number;
    note?: string;
  }>): Promise<{
    recorded: Array<{ transaction_id: number; member: Member }>;
    errors: any[];
    success_count: number;
    error_count: number;
  }> => {
    const response = await apiClient.post<ApiResponse<{
      recorded: Array<{ transaction_id: number; member: Member }>;
      errors: any[];
      success_count: number;
      error_count: number;
    }>>(`/orgs/${slug}/transactions/bulk/`, { payments });
    if (!response.data) {
      throw new ApiError('Bulk payment failed');
    }
    return response.data;
  },
};

// Staff Service
export const staffService = {
  listStaff: async (slug: string): Promise<Staff[]> => {
    const response = await apiClient.get<ApiResponse<Staff[]>>(`/orgs/${slug}/staff/`);
    return response.data || [];
  },

  addStaff: async (slug: string, data: {
    username: string;
    email?: string;
    first_name?: string;
    last_name?: string;
    password: string;
    role?: string;
  }): Promise<Staff> => {
    const response = await apiClient.post<ApiResponse<Staff>>(`/orgs/${slug}/staff/`, data);
    if (!response.data) {
      throw new ApiError('Failed to add staff');
    }
    return response.data;
  },

  updateStaff: async (slug: string, staffId: number, data: {
    role?: string;
    is_active?: boolean;
  }): Promise<Staff> => {
    const response = await apiClient.patch<ApiResponse<Staff>>(`/orgs/${slug}/staff/${staffId}/`, data);
    if (!response.data) {
      throw new ApiError('Failed to update staff');
    }
    return response.data;
  },

  deleteStaff: async (slug: string, staffId: number): Promise<{ message: string }> => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/orgs/${slug}/staff/${staffId}/`);
    if (!response.data) {
      throw new ApiError('Failed to delete staff');
    }
    return response.data;
  },
};

// Subscription Service
export const subscriptionService = {
  getSubscriptionStatus: async (slug: string): Promise<{
    subscription: SubscriptionInfo;
    pricing: {
      base_price_tzs: string;
      category_discount_percent: number;
      category: string;
      mpesa_number: string;
      mpesa_account_name: string;
      support_email: string;
      support_phone: string;
    };
    pending_request: any;
    recent_requests: any[];
  }> => {
    const response = await apiClient.get<ApiResponse<{
      subscription: SubscriptionInfo;
      pricing: any;
      pending_request: any;
      recent_requests: any[];
    }>>(`/orgs/${slug}/subscription/`);
    if (!response.data) {
      throw new ApiError('Failed to fetch subscription status');
    }
    return response.data;
  },

  createPaymentRequest: async (slug: string, data: {
    months: number;
    reference_note?: string;
    payment_method?: string;
    amount_sent?: number;
  }): Promise<any> => {
    const response = await apiClient.post<ApiResponse<any>>(`/orgs/${slug}/subscription/payment-requests/`, data);
    if (!response.data) {
      throw new ApiError('Failed to create payment request');
    }
    return response.data;
  },
};

// System Service
export const systemService = {
  healthCheck: async (): Promise<{ status: string; database: string; timestamp: string; version: string }> => {
    const response = await apiClient.get<ApiResponse<{ status: string; database: string; timestamp: string; version: string }>>('/health/');
    if (!response.data) {
      throw new ApiError('Health check failed');
    }
    return response.data;
  },

  getHelpInfo: async (): Promise<{
    support_email: string;
    support_phone: string;
    mpesa_number: string;
    mpesa_account_name: string;
    whatsapp_number: string;
  }> => {
    const response = await apiClient.get<ApiResponse<{
      support_email: string;
      support_phone: string;
      mpesa_number: string;
      mpesa_account_name: string;
      whatsapp_number: string;
    }>>('/help/');
    if (!response.data) {
      throw new ApiError('Failed to fetch help info');
    }
    return response.data;
  },
};

// Export/Import Service
export const exportService = {
  downloadMembersExcel: async (slug: string, search?: string, filter?: string): Promise<Blob> => {
    const params: any = {};
    if (search) params.search = search;
    if (filter) params.filter = filter;
    return apiClient.download(`/orgs/${slug}/export/members/excel/`, params);
  },

  downloadTransactionsExcel: async (slug: string, dateFrom?: string, dateTo?: string): Promise<Blob> => {
    const params: any = {};
    if (dateFrom) params.date_from = dateFrom;
    if (dateTo) params.date_to = dateTo;
    return apiClient.download(`/orgs/${slug}/export/transactions/excel/`, params);
  },

  downloadReportPDF: async (slug: string, search?: string, filter?: string): Promise<Blob> => {
    const params: any = {};
    if (search) params.search = search;
    if (filter) params.filter = filter;
    return apiClient.download(`/orgs/${slug}/export/report/pdf/`, params);
  },
};

export const importService = {
  importMembersExcel: async (slug: string, file: File, updateExisting: boolean = false, defaultPledge: number = 70000): Promise<{
    created_count: number;
    updated_count: number;
    transaction_count: number;
    errors: string[];
    total_errors: number;
  }> => {
    const formData = new FormData();
    formData.append('excel_file', file);
    formData.append('update_existing', updateExisting.toString());
    formData.append('default_pledge', defaultPledge.toString());

    const response = await apiClient.upload<ApiResponse<{
      created_count: number;
      updated_count: number;
      transaction_count: number;
      errors: string[];
      total_errors: number;
    }>>(`/orgs/${slug}/import/members/excel/`, formData);
    
    if (!response.data) {
      throw new ApiError('Import failed');
    }
    return response.data;
  },
};
