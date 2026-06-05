"use client";

import { useActionState } from "react";
import Link from "next/link";
import { requestPasswordReset, type AuthState } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initial: AuthState = {};

export default function ForgotPasswordPage() {
  const [state, action, pending] = useActionState(
    requestPasswordReset,
    initial
  );

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-semibold tracking-tight">Reset password</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Enter your email and we’ll send you a reset link.
      </p>

      {state.message ? (
        <p className="mt-6 rounded-md bg-green-50 p-4 text-sm text-green-700">
          {state.message}
        </p>
      ) : (
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

          {state.error && <p className="text-sm text-red-600">{state.error}</p>}

          <Button type="submit" disabled={pending}>
            {pending ? "Sending…" : "Send reset link"}
          </Button>
        </form>
      )}

      <p className="mt-4 text-center text-sm text-neutral-500">
        <Link href="/login" className="text-brand-600 hover:underline">
          Back to login
        </Link>
      </p>
    </div>
  );
}
