"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signUp } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, UserPlus } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    const result = await signUp.email({
      email: email.trim().toLowerCase(),
      password,
      name: name.trim(),
    });

    setLoading(false);

    if (result.error) {
      if (result.error.code === "USER_ALREADY_EXISTS") {
        setError("An account with this email already exists. Sign in instead.");
      } else {
        setError("Something went wrong. Please try again.");
      }
      return;
    }

    router.push("/account");
    router.refresh();
  }

  return (
    <div className="container-site flex min-h-[calc(100vh-4rem)] items-center justify-center py-16">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <UserPlus className="mx-auto mb-3 size-8 text-white/40" />
          <h1 className="text-2xl font-bold text-white">Create account</h1>
          <p className="mt-1 text-sm text-white/50">
            Track your orders and manage your licenses
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <label htmlFor="name" className="text-sm font-medium text-white/70">
              Name
            </label>
            <Input
              id="name"
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-11 rounded-xl border-white/10 bg-black/20 text-white placeholder:text-white/30"
              placeholder="Your name"
              disabled={loading}
            />
          </div>

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

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-medium text-white/70">
              Password
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 rounded-xl border-white/10 bg-black/20 pr-10 text-white placeholder:text-white/30"
                placeholder="At least 8 characters"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400" role="alert">
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="h-11 w-full rounded-xl"
          >
            {loading ? "Creating account…" : "Create account"}
          </Button>

          <p className="text-center text-xs text-white/30 leading-relaxed">
            By creating an account you agree to our{" "}
            <Link href="/legal/terms" className="underline hover:text-white/60 transition-colors">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/legal/privacy" className="underline hover:text-white/60 transition-colors">
              Privacy Policy
            </Link>
            .
          </p>
        </form>

        <p className="text-center text-sm text-white/40">
          Already have an account?{" "}
          <Link href="/auth/sign-in" className="text-white/70 underline hover:text-white transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
