"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signIn, type AuthState } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initial: AuthState = {};

export default function LoginPage() {
  const [state, action, pending] = useActionState(signIn, initial);

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Log in to your Zion Shop account.
      </p>

      <form action={action} className="mt-6 space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
          />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </div>

        {state.error && <p className="text-sm text-red-600">{state.error}</p>}

        <Button type="submit" disabled={pending}>
          {pending ? "Logging in…" : "Log in"}
        </Button>
      </form>

      <div className="mt-4 flex items-center justify-between text-sm">
        <Link href="/forgot-password" className="text-brand-600 hover:underline">
          Forgot password?
        </Link>
        <Link href="/signup" className="text-brand-600 hover:underline">
          Create account
        </Link>
      </div>
    </div>
  );
}
