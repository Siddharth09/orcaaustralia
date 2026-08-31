import { redirect } from "next/navigation";
import { peekMagicLinkToken, consumeMagicLinkToken } from "@/lib/magicLink";
import { getCustomerSession } from "@/lib/customerSession";

export const dynamic = "force-dynamic";

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const email = token ? await peekMagicLinkToken(token) : null;

  if (!token || !email) {
    redirect("/account?error=invalid_link");
  }

  async function confirmSignIn() {
    "use server";
    const signedInEmail = await consumeMagicLinkToken(token!);
    if (!signedInEmail) {
      redirect("/account?error=invalid_link");
    }
    const session = await getCustomerSession();
    session.email = signedInEmail;
    await session.save();
    redirect("/account");
  }

  return (
    <div className="mx-auto max-w-md px-6 py-16 text-center">
      <h1 className="text-2xl font-semibold text-navy">Confirm sign-in</h1>
      <p className="mt-2 text-sm text-navy/60">
        Sign in to Orca Australia as <strong>{email}</strong>?
      </p>
      <form action={confirmSignIn}>
        <button
          type="submit"
          className="mt-6 w-full rounded-full bg-navy py-3 text-sm font-semibold text-white transition hover:bg-navy-dark"
        >
          Confirm Sign In
        </button>
      </form>
    </div>
  );
}
