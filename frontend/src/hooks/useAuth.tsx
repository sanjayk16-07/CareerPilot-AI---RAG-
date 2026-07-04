/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { clearAuthToken, getAuthToken, setAuthToken } from "@/lib/auth-token";
import * as authApi from "@/lib/auth-api";
import type { AuthUser, LoginPayload, RegisterPayload } from "@/types/auth";

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<AuthUser | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [hasToken, setHasToken] = useState(() => Boolean(getAuthToken()));

  const profileQuery = useQuery({
    queryKey: ["auth", "me"],
    queryFn: authApi.getProfile,
    enabled: hasToken,
    retry: false
  });

  useEffect(() => {
    if (profileQuery.isError) {
      clearAuthToken();
      setHasToken(false);
      queryClient.removeQueries({ queryKey: ["auth"] });
    }
  }, [profileQuery.isError, queryClient]);

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: async (token) => {
      setAuthToken(token.access_token);
      setHasToken(true);
      await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    }
  });

  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: async (token) => {
      setAuthToken(token.access_token);
      setHasToken(true);
      await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    }
  });

  const handleLogout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      clearAuthToken();
      setHasToken(false);
      queryClient.removeQueries({ queryKey: ["auth"] });
    }
  }, [queryClient]);

  const refreshProfile = useCallback(async () => {
    if (!getAuthToken()) {
      return null;
    }

    return await queryClient.fetchQuery({
      queryKey: ["auth", "me"],
      queryFn: authApi.getProfile
    });
  }, [queryClient]);

  useEffect(() => {
    const token = getAuthToken();
    if (token !== null && token !== "") {
      setHasToken(true);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: profileQuery.data ?? null,
      isAuthenticated: Boolean(hasToken && profileQuery.data),
      isLoading: profileQuery.isFetching || loginMutation.isPending || registerMutation.isPending,
      login: async (payload) => {
        await loginMutation.mutateAsync(payload);
      },
      register: async (payload) => {
        await registerMutation.mutateAsync(payload);
      },
      logout: handleLogout,
      refreshProfile
    }),
    [
      handleLogout,
      hasToken,
      loginMutation,
      profileQuery.data,
      profileQuery.isFetching,
      refreshProfile,
      registerMutation
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
