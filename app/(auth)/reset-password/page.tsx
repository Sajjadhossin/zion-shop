"use client";

import { useActionState } from "react";
import { updatePassword, type AuthState } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initial: AuthState = {};

export default function ResetPasswordPage() {
  const [state, action, pending] = useActionState(updatePassword, initial);

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-semibold tracking-tight">
        Set a new password
      </h1>
      <p className="mt-1 text-sm text-neutral-500">
        Choose a strong password you don’t use elsewhere.
      </p>

      <form action={action} className="mt-6 space-y-4">
        <div>
          <Label htmlFor="password">New password</Label>
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
          {pending ? "Saving…" : "Update password"}
        </Button>
      </form>
    </div>
  );
}
