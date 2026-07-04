import { Navigate, Outlet, useLocation } from "react-router";
import { LoadingScreen } from "@/components/brand/LoadingScreen";
import { useAuth } from "@/hooks/useAuth";

export function ProtectedRoute() {
  const location = useLocation();
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

