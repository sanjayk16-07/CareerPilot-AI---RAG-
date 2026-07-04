import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { getErrorMessage } from "@/lib/errors";
import type { LoginPayload } from "@/types/auth";

export function LoginPage() {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);
  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;
  const {
    formState: { errors },
    handleSubmit,
    register
  } = useForm<LoginPayload>({
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    try {
      await login(values);
      navigate(from ?? "/dashboard", { replace: true });
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    }
  });

  return (
    <section className="grid w-full overflow-hidden rounded-lg border bg-card shadow-sm md:grid-cols-2">
      <div className="flex min-h-[520px] items-center justify-center border-b bg-background px-8 py-10 md:border-b-0 md:border-r">
        <BrandLogo surface="light" className="h-28 w-auto max-w-[320px]" />
      </div>
      <div className="flex min-h-[520px] items-center justify-center px-6 py-10">
        <Card className="w-full max-w-md border-0 shadow-none">
          <CardHeader className="px-0">
            <BrandLogo surface="light" className="mb-6 h-12 w-auto max-w-[220px]" />
            <CardTitle>Welcome back</CardTitle>
            <CardDescription>Sign in to your CareerPilot AI workspace.</CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <form className="space-y-4" onSubmit={onSubmit}>
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="you@example.com"
                  aria-label="Email address"
                  autoComplete="email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^\S+@\S+\.\S+$/,
                      message: "Enter a valid email address"
                    }
                  })}
                />
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Password"
                  aria-label="Password"
                  autoComplete="current-password"
                  {...register("password", {
                    required: "Password is required"
                  })}
                />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
              </div>
              {error && (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </div>
              )}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Login"}
              </Button>
            </form>
            <div className="mt-5 flex items-center justify-between text-sm">
              <Link className="text-primary hover:underline" to="/forgot-password">
                Forgot password?
              </Link>
              <Link className="text-primary hover:underline" to="/register">
                Create account
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
