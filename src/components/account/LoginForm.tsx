"use client";

import { useState } from "react";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/request-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      let data: { error?: string } = {};
      try {
        data = await res.json();
      } catch {
        // no JSON body
      }
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      setSent(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="mt-8 rounded-lg border border-black/10 bg-white p-6 text-center">
        <p className="font-medium text-navy">Check your inbox</p>
        <p className="mt-2 text-sm text-navy/60">
          We&apos;ve emailed a sign-in link to <strong>{email}</strong>. It
          expires in 30 minutes.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-3 rounded-lg border border-black/10 bg-white p-6">
      <label htmlFor="login-email" className="block text-sm font-medium text-navy">
        Email
      </label>
      <input
        id="login-email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full rounded border border-black/20 px-3 py-2 text-sm"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-navy py-3 text-sm font-semibold text-white transition hover:bg-navy-dark disabled:opacity-50"
      >
        {loading ? "Sending..." : "Email Me a Sign-In Link"}
      </button>
    </form>
  );
}
