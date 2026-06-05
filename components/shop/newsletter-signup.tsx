"use client";

import { useState } from "react";
import { Check, Send } from "lucide-react";

export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <div className="flex items-center justify-center gap-2 text-sm text-white">
        <Check size={18} className="text-green-400" />
        Thanks for subscribing — watch your inbox for the good stuff.
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (email.trim()) setDone(true);
      }}
      className="mx-auto flex max-w-md gap-2"
    >
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        className="h-11 flex-1 rounded-full border border-white/20 bg-white/10 px-5 text-sm text-white placeholder:text-white/50 focus:border-white/40 focus:outline-none"
      />
      <button
        type="submit"
        className="inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-medium text-neutral-900 transition hover:bg-neutral-100"
      >
        Subscribe <Send size={15} />
      </button>
    </form>
  );
}
