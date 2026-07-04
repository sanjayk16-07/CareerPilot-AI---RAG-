import { NavLink } from "react-router";
import { BriefcaseBusiness, LayoutDashboard, MessageSquareText, Route, User, History } from "lucide-react";
import { BrandIcon } from "@/components/brand/BrandIcon";
import { cn } from "@/lib/utils";

const sidebarItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Profile", href: "/profile", icon: User },
  { label: "Resume Analysis", href: "/dashboard/resume", icon: BriefcaseBusiness },
  { label: "AI Chat", href: "/dashboard/chat", icon: MessageSquareText },
  { label: "Career Roadmap", href: "/dashboard/roadmap", icon: Route },
  { label: "Activity History", href: "/dashboard/history", icon: History }
];

export function DashboardSidebar() {
  return (
    <aside className="hidden min-h-screen w-72 border-r bg-slate-950 px-4 py-5 text-white lg:block">
      <div className="mb-8 flex items-center gap-3 px-2">
        <BrandIcon className="h-12 w-12" />
        <span className="text-sm font-semibold tracking-normal">CareerPilot AI</span>
      </div>
      <nav className="space-y-2">
        {sidebarItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.href}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-slate-300 transition-colors hover:bg-white/10 hover:text-white",
                isActive && "bg-primary text-primary-foreground"
              )
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
