import { BrandIcon } from "@/components/brand/BrandIcon";

export function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="flex w-full max-w-xs flex-col items-center gap-5 rounded-lg border bg-card px-8 py-10 shadow-sm">
        <BrandIcon className="h-20 w-20" />
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full w-2/3 rounded-full bg-primary" />
        </div>
      </div>
    </div>
  );
}

