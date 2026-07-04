import { useState } from "react";
import { Link, NavLink } from "react-router";
import { Menu, X } from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { isAuthenticated } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = isAuthenticated
    ? [
        { to: "/dashboard", label: "Dashboard" },
        { to: "/dashboard/resume", label: "Resume" },
        { to: "/dashboard/chat", label: "AI Chat" },
        { to: "/dashboard/roadmap", label: "Roadmap" },
        { to: "/profile", label: "Profile" }
      ]
    : [
        { to: "/", label: "Home" },
        { to: "/login", label: "Login" },
        { to: "/register", label: "Register" }
      ];

  return (
    <header className="border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-col px-6">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center" onClick={() => setIsMobileMenuOpen(false)}>
            <BrandLogo surface="light" className="h-10 w-auto max-w-[190px]" />
          </Link>
          <nav className="hidden items-center gap-7 text-sm font-medium text-muted-foreground md:flex">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  cn("transition-colors hover:text-foreground", isActive && "text-foreground")
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
          <Button asChild className="hidden md:inline-flex">
            <Link to={isAuthenticated ? "/dashboard" : "/login"}>
              {isAuthenticated ? "Dashboard" : "Get Started"}
            </Link>
          </Button>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border md:hidden"
            aria-label="Toggle mobile navigation"
            aria-expanded={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen((open) => !open)}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="border-t py-4 md:hidden">
            <div className="flex flex-col gap-3 text-sm font-medium text-muted-foreground">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    cn("rounded-md px-2 py-2 transition-colors hover:text-foreground", isActive && "text-foreground")
                  }
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
