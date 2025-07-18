import { privateClient } from "@/utils/privateClient";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface User {
  id: number;
  email: string;
  name?: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
}

export class AuthService {
  private static readonly ACCESS_TOKEN_KEY = 'access_token';
  private static readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private static readonly USER_KEY = 'user';

  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await privateClient.post('/auth/login', credentials);
      const { data, status } = response;

      if (status === 200 && data) {
        // Store tokens
        this.setAccessToken(data.access_token);
        this.setRefreshToken(data.refresh_token);
        
        // Create user object from email (since API doesn't provide user details)
        const user: User = {
          id: 1, // Default ID since API doesn't provide it
          email: credentials.email,
          name: credentials.email.split('@')[0] // Extract name from email
        };
        
        this.setUser(user);
        
        // Return expected LoginResponse format
        return {
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          token_type: data.token_type,
          expires_in: data.expires_in,
          user: user
        };
      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  static async refreshToken(): Promise<RefreshTokenResponse> {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await privateClient.post('/auth/refresh', {
        refresh_token: refreshToken
      });
      
      const { data, status } = response;

      if (status && data) {
        this.setAccessToken(data.access_token);
        this.setRefreshToken(data.refresh_token);
        return data;
      } else {
        throw new Error('Token refresh failed');
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      this.logout(); // Clear invalid tokens
      throw error;
    }
  }

  static logout(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  static getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  static getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  static getUser(): User | null {
    const user = localStorage.getItem(this.USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  static isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  private static setAccessToken(token: string): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, token);
  }

  private static setRefreshToken(token: string): void {
    localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
  }

  private static setUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }
}
