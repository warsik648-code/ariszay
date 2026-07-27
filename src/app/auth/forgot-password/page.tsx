"use client";

import { useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    // Better Auth — we always show success to avoid user enumeration
    await authClient.requestPasswordReset?.({
      email: email.trim().toLowerCase(),
      redirectTo: "/auth/reset-password",
    }).catch(() => {});

    setLoading(false);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="container-site flex min-h-[calc(100vh-4rem)] items-center justify-center py-16">
        <div className="w-full max-w-sm text-center space-y-4">
          <Mail className="mx-auto size-10 text-white/40" />
          <h1 className="text-2xl font-bold text-white">Check your email</h1>
          <p className="text-sm text-white/50">
            If an account exists for{" "}
            <strong className="text-white/70">{email}</strong>, you will receive a
            password reset link shortly.
          </p>
          <Link
            href="/auth/sign-in"
            className="inline-block text-sm text-white/40 underline hover:text-white/70 transition-colors"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-site flex min-h-[calc(100vh-4rem)] items-center justify-center py-16">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <Mail className="mx-auto mb-3 size-8 text-white/40" />
          <h1 className="text-2xl font-bold text-white">Forgot password</h1>
          <p className="mt-1 text-sm text-white/50">
            Enter your email and we&apos;ll send a reset link
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium text-white/70">
              Email address
            </label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 rounded-xl border-white/10 bg-black/20 text-white placeholder:text-white/30"
              placeholder="you@example.com"
              disabled={loading}
            />
          </div>

          <Button
            type="submit"
            disabled={loading || !email}
            className="h-11 w-full rounded-xl"
          >
            {loading ? "Sending…" : "Send reset link"}
          </Button>
        </form>

        <p className="text-center text-sm text-white/40">
          Remember your password?{" "}
          <Link href="/auth/sign-in" className="text-white/70 underline hover:text-white transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
