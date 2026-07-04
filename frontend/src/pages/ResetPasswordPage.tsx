import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { resetPassword } from "@/lib/auth-api";
import { getErrorMessage } from "@/lib/errors";

interface ResetPasswordForm {
  token: string;
  password: string;
}

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const mutation = useMutation({
    mutationFn: ({ token, password }: ResetPasswordForm) => resetPassword(token, password)
  });
  const {
    formState: { errors },
    handleSubmit,
    register
  } = useForm<ResetPasswordForm>({
    defaultValues: {
      token: searchParams.get("token") ?? "",
      password: ""
    }
  });

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    try {
      await mutation.mutateAsync(values);
      navigate("/login", { replace: true });
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    }
  });

  return (
    <section className="mx-auto w-full max-w-lg">
      <Card>
        <CardHeader>
          <BrandLogo surface="light" className="mb-4 h-12 w-auto max-w-[220px]" />
          <CardTitle>Choose a new password</CardTitle>
          <CardDescription>Use the reset token from your password reset request.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            <Input
              placeholder="Reset token"
              {...register("token", {
                required: "Reset token is required"
              })}
            />
            {errors.token && <p className="text-sm text-destructive">{errors.token.message}</p>}
            <Input
              type="password"
              placeholder="New password"
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
            {error && (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={mutation.isPending}>
              {mutation.isPending ? "Updating..." : "Reset password"}
            </Button>
          </form>
          <p className="mt-5 text-center text-sm text-muted-foreground">
            Remembered your password?{" "}
            <Link className="text-primary hover:underline" to="/login">
              Login
            </Link>
          </p>
        </CardContent>
      </Card>
    </section>
  );
}

