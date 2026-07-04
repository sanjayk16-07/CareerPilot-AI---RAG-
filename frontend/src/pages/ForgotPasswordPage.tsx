import { useState } from "react";
import { Link } from "react-router";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { forgotPassword } from "@/lib/auth-api";
import { getErrorMessage } from "@/lib/errors";

interface ForgotPasswordForm {
  email: string;
}

export function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const mutation = useMutation({ mutationFn: forgotPassword });
  const {
    formState: { errors },
    handleSubmit,
    register
  } = useForm<ForgotPasswordForm>({ defaultValues: { email: "" } });

  const onSubmit = handleSubmit(async ({ email }) => {
    setError(null);
    try {
      await mutation.mutateAsync(email);
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    }
  });

  return (
    <section className="mx-auto w-full max-w-lg">
      <Card>
        <CardHeader>
          <BrandLogo surface="light" className="mb-4 h-12 w-auto max-w-[220px]" />
          <CardTitle>Reset your password</CardTitle>
          <CardDescription>Enter your email to generate a secure reset token.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
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
            {error && (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}
            {mutation.data && (
              <div className="space-y-3 rounded-md border bg-muted px-3 py-3 text-sm">
                <p>{mutation.data.message}</p>
                {mutation.data.reset_token && (
                  <Link
                    className="inline-flex text-primary hover:underline"
                    to={`/reset-password?token=${encodeURIComponent(mutation.data.reset_token)}`}
                  >
                    Continue to reset password
                  </Link>
                )}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={mutation.isPending}>
              {mutation.isPending ? "Sending..." : "Send reset instructions"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}

