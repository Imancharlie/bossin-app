import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// API Configuration
const API_BASE_URL = 'https://bossin.kodin.co.tz/api/v1';

const ACCESS_TOKEN_KEY = '@bossin_access_token';
const REFRESH_TOKEN_KEY = '@bossin_refresh_token';

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  success: boolean;
  data: T[];
  error: string | null;
}

// Error Types
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public originalError?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Token Management
export const TokenManager = {
  getAccessToken: async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  },

  getRefreshToken: async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  },

  setTokens: async (accessToken: string, refreshToken: string): Promise<void> => {
    try {
      await AsyncStorage.multiSet([
        [ACCESS_TOKEN_KEY, accessToken],
        [REFRESH_TOKEN_KEY, refreshToken],
      ]);
    } catch (error) {
      console.error('Error setting tokens:', error);
      throw error;
    }
  },

  clearTokens: async (): Promise<void> => {
    try {
      await AsyncStorage.multiRemove([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY]);
    } catch (error) {
      console.error('Error clearing tokens:', error);
    }
  },
};

// Error Message Mapping
const getErrorMessage = (error: any): string => {
  // Network errors
  if (!error.response) {
    if (error.code === 'ECONNABORTED') {
      return 'Request timeout. Please check your internet connection and try again.';
    }
    if (error.message?.includes('Network request failed')) {
      return 'Unable to connect. Please check your internet connection and try again.';
    }
    return 'Network error. Please check your connection and try again.';
  }

  // Server errors with status codes
  const status = error.response?.status;
  const data = error.response?.data;

  switch (status) {
    case 400:
      return data?.error || 'Invalid request. Please check your input.';
    case 401:
      return 'Session expired. Please log in again.';
    case 403:
      return data?.error || 'You do not have permission to perform this action.';
    case 404:
      return 'The requested resource was not found.';
    case 402:
      return data?.error || 'Subscription expired. Please renew to continue.';
    case 429:
      return 'Too many requests. Please wait a moment and try again.';
    case 500:
      return 'Server error. Please try again later.';
    case 502:
    case 503:
      return 'Service unavailable. Please try again later.';
    default:
      return data?.error || 'An unexpected error occurred. Please try again.';
  }
};

// Request Interceptor
const addAuthHeader = async (config: any) => {
  const token = await TokenManager.getAccessToken();
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }
  return config;
};

// Response Interceptor for Token Refresh
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

const onTokenRefreshed = (token: string) => {
  refreshSubscribers.forEach(callback => callback(token));
  refreshSubscribers = [];
};

const refreshAccessToken = async (): Promise<string> => {
  const refreshToken = await TokenManager.getRefreshToken();
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    const data = await response.json();
    const newAccessToken = data.data.tokens.access;
    const newRefreshToken = data.data.tokens.refresh;

    await TokenManager.setTokens(newAccessToken, newRefreshToken);
    return newAccessToken;
  } catch (error) {
    await TokenManager.clearTokens();
    throw error;
  }
};

// API Client Class
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    try {
      // Add auth header
      const config = await addAuthHeader({
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      const url = `${this.baseURL}${endpoint}`;
      const response = await fetch(url, config);

      // Handle 401 - try to refresh token
      if (response.status === 401) {
        if (!isRefreshing) {
          isRefreshing = true;
          try {
            const newToken = await refreshAccessToken();
            isRefreshing = false;
            onTokenRefreshed(newToken);
            
            // Retry original request with new token
            const retryConfig = await addAuthHeader({
              ...options,
              headers: {
                'Content-Type': 'application/json',
                ...options.headers,
              },
            });
            const retryResponse = await fetch(url, retryConfig);
            return await this.handleResponse<T>(retryResponse);
          } catch (refreshError) {
            isRefreshing = false;
            throw new ApiError('Session expired. Please log in again.', 401, refreshError);
          }
        } else {
          // Wait for token refresh to complete
          return new Promise((resolve, reject) => {
            subscribeTokenRefresh(async (token) => {
              try {
                const retryConfig = await addAuthHeader({
                  ...options,
                  headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                  },
                });
                const retryResponse = await fetch(url, retryConfig);
                resolve(await this.handleResponse<T>(retryResponse));
              } catch (error) {
                reject(error);
              }
            });
          });
        }
      }

      return await this.handleResponse<T>(response);
    } catch (error: any) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(getErrorMessage(error), error.response?.status, error);
    }
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');

    if (!response.ok) {
      const errorData = isJson ? await response.json() : {};
      throw {
        response: {
          status: response.status,
          data: errorData,
        },
      };
    }

    if (isJson) {
      return await response.json();
    }

    return (await response.text()) as unknown as T;
  }

  // HTTP Methods
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const queryString = params 
      ? '?' + new URLSearchParams(params as any).toString()
      : '';
    return this.request<T>(endpoint + queryString);
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }

  // File upload
  async upload<T>(endpoint: string, formData: FormData): Promise<T> {
    const token = await TokenManager.getAccessToken();
    const headers: Record<string, string> = {};
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    });

    return await this.handleResponse<T>(response);
  }

  // File download
  async download(endpoint: string, params?: Record<string, any>): Promise<Blob> {
    const queryString = params 
      ? '?' + new URLSearchParams(params as any).toString()
      : '';
    
    const token = await TokenManager.getAccessToken();
    const headers: Record<string, string> = {};
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseURL}${endpoint}${queryString}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw {
        response: {
          status: response.status,
          data: errorData,
        },
      };
    }

    return await response.blob();
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export for testing
export { ApiClient };
