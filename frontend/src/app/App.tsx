import { QueryClientProvider } from "@tanstack/react-query";
import { Suspense } from "react";
import { RouterProvider } from "react-router";
import { LoadingScreen } from "@/components/brand/LoadingScreen";
import { AuthProvider } from "@/hooks/useAuth";
import { queryClient } from "@/lib/query-client";
import { router } from "@/app/router";

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Suspense fallback={<LoadingScreen />}>
          <RouterProvider router={router} />
        </Suspense>
      </AuthProvider>
    </QueryClientProvider>
  );
}
