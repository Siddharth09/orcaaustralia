import { redirect } from "next/navigation";
import { timingSafeEqual } from "crypto";
import { getAdminSession } from "@/lib/session";

function passwordsMatch(a: string, b: string) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

async function login(formData: FormData) {
  "use server";

  const password = String(formData.get("password") ?? "");
  const expected = process.env.ADMIN_PASSWORD ?? "";

  if (!expected || !passwordsMatch(password, expected)) {
    redirect("/admin/login?error=1");
  }

  const session = await getAdminSession();
  session.isAdmin = true;
  await session.save();
  redirect("/admin");
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <form
        action={login}
        className="w-full max-w-sm rounded-lg border border-black/10 bg-white p-8 shadow-sm"
      >
        <h1 className="text-xl font-semibold text-navy">Orca Australia Admin</h1>
        <p className="mt-1 text-sm text-navy/60">Sign in to manage the store.</p>

        <label className="mt-6 block text-sm font-medium text-navy" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoFocus
          className="mt-2 w-full rounded border border-black/20 px-3 py-2 text-sm"
        />

        {error && (
          <p className="mt-3 text-sm text-red-600">Incorrect password. Try again.</p>
        )}

        <button
          type="submit"
          className="mt-6 w-full rounded-full bg-navy py-3 text-sm font-semibold text-white transition hover:bg-navy-dark"
        >
          Sign In
        </button>
      </form>
    </div>
  );
}
