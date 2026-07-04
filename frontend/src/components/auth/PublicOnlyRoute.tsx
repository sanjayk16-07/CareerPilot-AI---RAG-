import { Navigate, Outlet } from "react-router";
import { LoadingScreen } from "@/components/brand/LoadingScreen";
import { useAuth } from "@/hooks/useAuth";

export function PublicOnlyRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

