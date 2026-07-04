import { createBrowserRouter } from "react-router";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PublicOnlyRoute } from "@/components/auth/PublicOnlyRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import { DashboardPage } from "@/pages/DashboardPage";
import { ForgotPasswordPage } from "@/pages/ForgotPasswordPage";
import { HomePage } from "@/pages/HomePage";
import { LoginPage } from "@/pages/LoginPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { RegisterPage } from "@/pages/RegisterPage";
import { ResetPasswordPage } from "@/pages/ResetPasswordPage";
import { ResumePage } from "@/pages/ResumePage";
import { AIChatPage } from "@/pages/AIChatPage";
import { RoadmapPage } from "@/pages/RoadmapPage";
import { HistoryPage } from "@/pages/HistoryPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <HomePage />
      },
      {
        element: <PublicOnlyRoute />,
        children: [
          {
            path: "login",
            element: <LoginPage />
          },
          {
            path: "register",
            element: <RegisterPage />
          },
          {
            path: "forgot-password",
            element: <ForgotPasswordPage />
          },
          {
            path: "reset-password",
            element: <ResetPasswordPage />
          }
        ]
      }
    ]
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/dashboard",
        element: <DashboardPage />
      },
      {
        path: "/dashboard/resume",
        element: <ResumePage />
      },
      {
        path: "/dashboard/chat",
        element: <AIChatPage />
      },
      {
        path: "/dashboard/roadmap",
        element: <RoadmapPage />
      },
      {
        path: "/dashboard/history",
        element: <HistoryPage />
      },
      {
        path: "/profile",
        element: <ProfilePage />
      }
    ]
  },

  {
    path: "*",
    element: <NotFoundPage />
  }
]);
