import { Link, useNavigate } from "react-router";
import { BrandIcon } from "@/components/brand/BrandIcon";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export function ProfilePage() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="flex h-16 items-center justify-between border-b bg-background px-5 md:px-8">
        <BrandLogo surface="light" className="h-10 w-auto max-w-[190px]" />
        <div className="flex items-center gap-3">
          <Button asChild type="button" variant="outline">
            <Link to="/profile">Profile</Link>
          </Button>
          <Button type="button" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-xl px-5 py-10">
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          {/* Profile header */}
          <div className="flex items-center gap-4 p-6 border-b border-border">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <BrandIcon className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-lg font-bold">User Profile</h1>
              <p className="text-sm text-muted-foreground">Your authenticated CareerPilot AI account.</p>
            </div>
          </div>

          {/* Fields — Name + Email only */}
          <div className="p-6 space-y-4">
            <div className="rounded-lg border border-border bg-background p-4 space-y-4">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Name</p>
                <p className="font-medium">{user?.full_name || "Not provided"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Email</p>
                <p className="font-medium">{user?.email}</p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="outline">
                <Link to="/dashboard">Back to dashboard</Link>
              </Button>
              <Button type="button" variant="default">
                Edit Profile
              </Button>
            </div>
            <Button
              type="button"
              variant="destructive"
              className="w-full"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
