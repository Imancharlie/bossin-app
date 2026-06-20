import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "@/types";
import { authService, TokenManager, LoginRequest, ApiError } from "@/services";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => ({ success: false }),
  logout: async () => {},
  refreshUser: async () => {},
});

const USER_KEY = "@bossin_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem(USER_KEY);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Error loading user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await authService.login({ username, password });
      
      // Store tokens
      await TokenManager.setTokens(response.tokens.access, response.tokens.refresh);
      
      // Store user
      const userData = {
        id: response.user.id,
        username: response.user.username,
        email: response.user.email,
        first_name: response.user.first_name,
        last_name: response.user.last_name,
        phone: response.user.phone,
        needs_onboarding: response.user.needs_onboarding,
        onboarding_completed: response.user.onboarding_completed,
      };
      
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
      setUser(userData);

      // Store organization slug from default_org or first organization
      console.log("[Auth] Login response organizations:", response.organizations);
      console.log("[Auth] Login response default_org:", response.default_org);
      const orgSlug = response.default_org?.slug || response.organizations?.[0]?.slug;
      if (orgSlug) {
        await AsyncStorage.setItem("@bossin_org_slug", orgSlug);
        console.log("[Auth] Stored organization slug:", orgSlug);
      } else {
        console.error("[Auth] No organization slug found in login response!");
      }
      
      return { success: true };
    } catch (error) {
      if (error instanceof ApiError) {
        return { success: false, error: error.message };
      }
      return { success: false, error: "Login failed. Please try again." };
    }
  };

  const logout = async () => {
    try {
      console.log('[Auth] Logging out...');
      await TokenManager.clearTokens();
      await AsyncStorage.removeItem(USER_KEY);
      await AsyncStorage.removeItem("@bossin_org_slug");
      setUser(null);
      console.log('[Auth] Logout successful');
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const refreshUser = async () => {
    try {
      const response = await authService.getCurrentUser();
      const userData = {
        id: response.user.id,
        username: response.user.username,
        email: response.user.email,
        first_name: response.user.first_name,
        last_name: response.user.last_name,
        phone: response.user.phone,
        needs_onboarding: response.user.needs_onboarding,
        onboarding_completed: response.user.onboarding_completed,
      };
      
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error("Error refreshing user:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
