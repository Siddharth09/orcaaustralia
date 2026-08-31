import { sealData, unsealData } from "iron-session";
import { customerSessionOptions } from "@/lib/customerSession";
import { prisma } from "@/lib/prisma";

const TTL_SECONDS = 30 * 60;
const REQUEST_COOLDOWN_SECONDS = 60;

interface MagicLinkPayload {
  email: string;
  purpose: "login";
  jti: string;
}

export async function createMagicLinkToken(email: string) {
  const payload: MagicLinkPayload = {
    email,
    purpose: "login",
    jti: crypto.randomUUID(),
  };
  return sealData(payload, {
    password: customerSessionOptions.password,
    ttl: TTL_SECONDS,
  });
}

async function unsealMagicLinkToken(token: string) {
  try {
    const data = await unsealData<MagicLinkPayload>(token, {
      password: customerSessionOptions.password,
      ttl: TTL_SECONDS,
    });
    if (data.purpose !== "login" || !data.email || !data.jti) return null;
    return data;
  } catch {
    return null;
  }
}

// Read-only check: is this token well-formed and not expired? Does NOT mark
// it used. Safe to call from a plain GET page, including when an email
// security scanner (Gmail/Outlook "Safe Links") prefetches the link before
// the recipient actually clicks it.
export async function peekMagicLinkToken(token: string) {
  const data = await unsealMagicLinkToken(token);
  return data?.email ?? null;
}

// Marks the token used so it can never be redeemed again, and returns the
// signed-in email. Only call this from the actual sign-in action (a button
// click / POST), never from the initial link GET — see peekMagicLinkToken.
export async function consumeMagicLinkToken(token: string) {
  const data = await unsealMagicLinkToken(token);
  if (!data) return null;

  try {
    await prisma.magicLinkToken.create({ data: { jti: data.jti } });
  } catch {
    // Unique constraint violation — this token was already used.
    return null;
  }

  return data.email;
}

// Basic per-email cooldown so the login-link endpoint can't be used to spam
// arbitrary inboxes. Returns true if a new link may be sent.
export async function claimMagicLinkRequestSlot(email: string) {
  const now = new Date();
  const cutoff = new Date(now.getTime() - REQUEST_COOLDOWN_SECONDS * 1000);

  const existing = await prisma.magicLinkRequest.findUnique({ where: { email } });
  if (existing && existing.lastRequestAt > cutoff) {
    return false;
  }

  await prisma.magicLinkRequest.upsert({
    where: { email },
    create: { email, lastRequestAt: now },
    update: { lastRequestAt: now },
  });
  return true;
}
