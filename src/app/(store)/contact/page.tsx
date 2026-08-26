"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";

function ContactForm() {
  const searchParams = useSearchParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [orderNumber, setOrderNumber] = useState(searchParams.get("order") ?? "");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, orderNumber: orderNumber || undefined, message }),
      });
      let data: { error?: string } = {};
      try {
        data = await res.json();
      } catch {
        // no JSON body
      }
      if (!res.ok) throw new Error(data.error ?? "Something went wrong. Please try again.");
      setSent(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="mt-8 rounded-lg border border-black/10 bg-white p-8 text-center">
        <h2 className="text-lg font-semibold text-navy">Message sent</h2>
        <p className="mt-2 text-sm text-navy/70">
          Thanks for reaching out — we usually reply within 1–2 business days.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4 rounded-lg border border-black/10 bg-white p-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-navy">
          Name
        </label>
        <input
          id="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded border border-black/20 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-navy">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded border border-black/20 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label htmlFor="orderNumber" className="block text-sm font-medium text-navy">
          Order Number <span className="text-navy/50">(optional)</span>
        </label>
        <input
          id="orderNumber"
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
          placeholder="A1B2C3D4"
          className="mt-1 w-full rounded border border-black/20 px-3 py-2 text-sm uppercase"
        />
      </div>
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-navy">
          Message
        </label>
        <textarea
          id="message"
          required
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell us what's going on — refund request, sizing question, order issue..."
          className="mt-1 w-full rounded border border-black/20 px-3 py-2 text-sm"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-navy py-3 text-sm font-semibold text-white transition hover:bg-navy-dark disabled:opacity-50"
      >
        {loading ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-2xl font-semibold text-navy">Contact &amp; Support</h1>
      <p className="mt-2 text-sm text-navy/60">
        Need a refund, have a sizing question, or something not quite right with
        your order? Send us a message and we&apos;ll get back to you — or email{" "}
        <a href="mailto:support@astryks.com" className="underline hover:text-navy">
          support@astryks.com
        </a>{" "}
        directly.
      </p>
      <Suspense>
        <ContactForm />
      </Suspense>
    </div>
  );
}
