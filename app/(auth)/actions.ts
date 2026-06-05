"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export type AuthState = { error?: string; message?: string };

/** Best-effort site origin for building email redirect links. */
async function siteOrigin() {
  const h = await headers();
  const origin = h.get("origin");
  if (origin) return origin;
  const host = h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  return host
    ? `${proto}://${host}`
    : process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export async function signIn(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Email and password are required." };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) return { error: error.message };

  // Route admins to the admin panel, everyone else to their account.
  let role: string | undefined;
  if (data.user) {
    const dbUser = await prisma.user.findUnique({
      where: { id: data.user.id },
      select: { role: true },
    });
    role = dbUser?.role;
  }

  revalidatePath("/", "layout");
  redirect(role === "ADMIN" ? "/admin" : "/account");
}

export async function signUp(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!name) return { error: "Please enter your name." };
  if (!email) return { error: "Please enter your email." };
  if (password.length < 8)
    return { error: "Password must be at least 8 characters." };

  const supabase = await createClient();
  const origin = await siteOrigin();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
      emailRedirectTo: `${origin}/auth/callback?next=/account`,
    },
  });
  if (error) return { error: error.message };

  // Mirror the auth user into our app DB (id MUST equal the Supabase auth UID).
  if (data.user) {
    await prisma.user.upsert({
      where: { id: data.user.id },
      update: { name },
      create: { id: data.user.id, email, name, role: "CUSTOMER" },
    });
  }

  if (data.session) {
    revalidatePath("/", "layout");
    redirect("/account");
  }

  return {
    message: "Check your email to confirm your account, then log in.",
  };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

export async function requestPasswordReset(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { error: "Please enter your email." };

  const supabase = await createClient();
  const origin = await siteOrigin();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/reset-password`,
  });
  if (error) return { error: error.message };

  return { message: "If that email exists, a reset link is on its way." };
}

export async function updatePassword(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const password = String(formData.get("password") ?? "");
  if (password.length < 8)
    return { error: "Password must be at least 8 characters." };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };

  redirect("/account");
}
