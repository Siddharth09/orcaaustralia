import Link from "next/link";

export default function CheckoutCancelPage() {
  return (
    <div className="mx-auto max-w-xl px-6 py-24 text-center">
      <h1 className="text-3xl font-semibold text-navy">Checkout cancelled</h1>
      <p className="mt-4 text-navy/70">
        Your cart is still saved. You can pick up where you left off any time.
      </p>
      <Link
        href="/cart"
        className="mt-8 inline-block rounded-full bg-navy px-8 py-3 text-sm font-semibold text-white"
      >
        Back to Cart
      </Link>
    </div>
  );
}
