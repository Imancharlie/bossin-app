import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "@/types";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => false,
  logout: async () => {},
});

const AUTH_KEY = "@bossin_user";

const DEMO_USERS: Record<string, { password: string; user: User }> = {
  bossin: {
    password: "bossin123",
    user: { username: "bossin", role: "admin", organizationId: "org_1" },
  },
  admin: {
    password: "admin",
    user: { username: "admin", role: "admin", organizationId: "org_1" },
  },
  staff: {
    password: "staff123",
    user: { username: "staff", role: "staff", organizationId: "org_1" },
  },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(AUTH_KEY).then((val) => {
      if (val) {
        try {
          setUser(JSON.parse(val));
        } catch {}
      }
      setIsLoading(false);
    });
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    const record = DEMO_USERS[username.toLowerCase()];
    if (record && record.password === password) {
      await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(record.user));
      setUser(record.user);
      return true;
    }
    return false;
  };

  const logout = async () => {
    await AsyncStorage.removeItem(AUTH_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
