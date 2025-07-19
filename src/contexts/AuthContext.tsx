'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import { useWallet } from '@/hooks/useWallet';
import { ClientAuthService } from '@/lib/auth/client';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => void;
  token: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { address, isConnected, connectWallet, signMessage } = useWallet();

  useEffect(() => {
    // Check for stored token on mount
    const storedToken = localStorage.getItem('auth_token');
    if (storedToken && ClientAuthService.isValidTokenFormat(storedToken)) {
      const decoded = ClientAuthService.decodeTokenPayload(storedToken);
      if (decoded && decoded.userId) {
        setToken(storedToken);
        // Fetch user data
        fetchUserData(decoded.userId);
      } else {
        localStorage.removeItem('auth_token');
      }
    }
    setIsLoading(false);
  }, []);

  const fetchUserData = async (userId: string) => {
    try {
      const response = await fetch(`/api/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    }
  };

  const login = async () => {
    try {
      setIsLoading(true);

      // Connect wallet if not connected
      let walletAddress = address;
      if (!isConnected) {
        walletAddress = await connectWallet();
      }

      if (!walletAddress) {
        throw new Error('Failed to connect wallet');
      }

      // Get nonce
      const nonceResponse = await fetch('/api/auth/nonce', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: walletAddress }),
      });

      if (!nonceResponse.ok) {
        throw new Error('Failed to get nonce');
      }

      const { data: { nonce } } = await nonceResponse.json();

      // Generate message and sign
      const message = ClientAuthService.generateAuthMessage(walletAddress, nonce);
      const signature = await signMessage(message);

      // Login
      const loginResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: walletAddress,
          message,
          signature,
          nonce,
        }),
      });

      if (!loginResponse.ok) {
        throw new Error('Login failed');
      }

      const { data: { user: userData, token: authToken } } = await loginResponse.json();

      setUser(userData);
      setToken(authToken);
      localStorage.setItem('auth_token', authToken);

    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_token');
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    logout,
    token,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}