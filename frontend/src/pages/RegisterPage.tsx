import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { getErrorMessage } from "@/lib/errors";
import type { RegisterPayload } from "@/types/auth";

export function RegisterPage() {
  const { register: registerAccount, isLoading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const {
    formState: { errors },
    handleSubmit,
    register
  } = useForm<RegisterPayload>({
    defaultValues: {
      email: "",
      full_name: "",
      password: ""
    }
  });

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    try {
      await registerAccount(values);
      navigate("/dashboard", { replace: true });
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    }
  });

  return (
    <section className="mx-auto w-full max-w-lg">
      <Card>
        <CardHeader>
          <BrandLogo surface="light" className="mb-4 h-12 w-auto max-w-[220px]" />
          <CardTitle>Create your account</CardTitle>
          <CardDescription>Start your CareerPilot AI workspace.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Input
                placeholder="Full name"
                autoComplete="name"
                {...register("full_name", {
                  maxLength: {
                    value: 120,
                    message: "Full name must be 120 characters or fewer"
                  }
                })}
              />
              {errors.full_name && (
                <p className="text-sm text-destructive">{errors.full_name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="you@example.com"
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
                autoComplete="new-password"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters"
                  }
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
              {isLoading ? "Creating account..." : "Register"}
            </Button>
          </form>
          <p className="mt-5 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link className="text-primary hover:underline" to="/login">
              Login
            </Link>
          </p>
        </CardContent>
      </Card>
    </section>
  );
}

