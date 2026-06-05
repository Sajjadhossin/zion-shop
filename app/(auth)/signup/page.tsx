"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signUp, type AuthState } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initial: AuthState = {};

export default function SignupPage() {
  const [state, action, pending] = useActionState(signUp, initial);

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-semibold tracking-tight">Create account</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Join Zion Shop in a few seconds.
      </p>

      {state.message ? (
        <p className="mt-6 rounded-md bg-green-50 p-4 text-sm text-green-700">
          {state.message}
        </p>
      ) : (
        <form action={action} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="name">Full name</Label>
            <Input id="name" name="name" type="text" autoComplete="name" required />
          </div>
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
              autoComplete="new-password"
              required
              minLength={8}
              placeholder="At least 8 characters"
            />
          </div>

          {state.error && <p className="text-sm text-red-600">{state.error}</p>}

          <Button type="submit" disabled={pending}>
            {pending ? "Creating…" : "Create account"}
          </Button>
        </form>
      )}

      <p className="mt-4 text-center text-sm text-neutral-500">
        Already have an account?{" "}
        <Link href="/login" className="text-brand-600 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
