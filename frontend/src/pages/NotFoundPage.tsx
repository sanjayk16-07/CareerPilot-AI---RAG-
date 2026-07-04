import { Link } from "react-router";
import { Button } from "@/components/ui/button";

export function NotFoundPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center text-foreground">
      <h1 className="text-3xl font-semibold">Page not found</h1>
      <p className="text-muted-foreground">The route you requested is not available.</p>
      <Button asChild>
        <Link to="/">Return home</Link>
      </Button>
    </main>
  );
}

