import React, { createContext, useEffect, useState, useCallback } from "react";
import type { ReactNode } from "react";
import { AuthService } from "@/service/authService";
import type { User, LoginRequest } from "@/service/authService";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export { AuthContext };

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback((): void => {
    AuthService.logout();
    setUser(null);
  }, []);

  const refreshToken = useCallback(async (): Promise<void> => {
    try {
      await AuthService.refreshToken();
      const storedUser = AuthService.getUser();
      setUser(storedUser);
    } catch (error) {
      console.error("Token refresh failed:", error);
      logout();
      throw error;
    }
  }, [logout]);

  useEffect(() => {
    // Check if user is already authenticated on app start
    const initializeAuth = async () => {
      try {
        const storedUser = AuthService.getUser();
        const accessToken = AuthService.getAccessToken();

        if (storedUser && accessToken) {
          setUser(storedUser);
        } else if (AuthService.getRefreshToken()) {
          // Try to refresh the token
          await refreshToken();
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        AuthService.logout();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [refreshToken]);

  const login = async (credentials: LoginRequest): Promise<void> => {
    try {
      setIsLoading(true);
      console.log("Starting login process...", credentials.email);
      const response = await AuthService.login(credentials);
      console.log("Login response received:", response);
      setUser(response.user);
      console.log("User state updated:", response.user);
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
      console.log("Login process completed");
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
