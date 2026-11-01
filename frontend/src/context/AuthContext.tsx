"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";

export interface User {
  id: number;
  email: string;
  role: "recruiter" | "talent" | "admin";
  talent_type?: string;
  name?: string;
  company_name?: string;
  company_id?: number;
  profile_id?: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  registerRecruiter: (data: any) => Promise<User>;
  registerTalent: (data: any) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  const refreshUser = async () => {
    try {
      const storedToken = localStorage.getItem("nexora_token") || localStorage.getItem("token");
      if (!storedToken) {
        setUser(null);
        setToken(null);
        setIsLoading(false);
        return;
      }
      setToken(storedToken);
      localStorage.setItem("nexora_token", storedToken);
      localStorage.setItem("token", storedToken);
      const userData = await apiRequest<User>("/auth/me");
      setUser(userData);
    } catch {
      localStorage.removeItem("nexora_token");
      localStorage.removeItem("token");
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const res = await apiRequest<{
      access_token: string;
      role: "recruiter" | "talent" | "admin";
      user_id: number;
      email: string;
      talent_type?: string;
      name?: string;
    }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    localStorage.setItem("nexora_token", res.access_token);
    localStorage.setItem("token", res.access_token);
    setToken(res.access_token);

    const currentUser: User = {
      id: res.user_id,
      email: res.email,
      role: res.role,
      talent_type: res.talent_type,
      name: res.name,
    };
    setUser(currentUser);
    return currentUser;
  };

  const registerRecruiter = async (data: any): Promise<User> => {
    const res = await apiRequest<{
      access_token: string;
      role: "recruiter";
      user_id: number;
      email: string;
      name?: string;
    }>("/auth/register/recruiter", {
      method: "POST",
      body: JSON.stringify(data),
    });

    localStorage.setItem("nexora_token", res.access_token);
    localStorage.setItem("token", res.access_token);
    setToken(res.access_token);

    const currentUser: User = {
      id: res.user_id,
      email: res.email,
      role: "recruiter",
      name: res.name,
      company_name: data.company_name,
    };
    setUser(currentUser);
    return currentUser;
  };

  const registerTalent = async (data: any): Promise<User> => {
    const res = await apiRequest<{
      access_token: string;
      role: "talent";
      user_id: number;
      email: string;
      talent_type?: string;
      name?: string;
    }>("/auth/register/talent", {
      method: "POST",
      body: JSON.stringify(data),
    });

    localStorage.setItem("nexora_token", res.access_token);
    localStorage.setItem("token", res.access_token);
    setToken(res.access_token);

    const currentUser: User = {
      id: res.user_id,
      email: res.email,
      role: "talent",
      talent_type: res.talent_type,
      name: res.name,
    };
    setUser(currentUser);
    return currentUser;
  };

  const logout = () => {
    localStorage.removeItem("nexora_token");
    localStorage.removeItem("token");
    setUser(null);
    setToken(null);
    router.push("/");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        registerRecruiter,
        registerTalent,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
