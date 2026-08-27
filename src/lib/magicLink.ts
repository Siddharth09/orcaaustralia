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

// Returns the email for a valid, not-yet-used, not-expired token, and
// atomically marks it used so the same link can't be replayed.
export async function verifyMagicLinkToken(token: string) {
  try {
    const data = await unsealData<MagicLinkPayload>(token, {
      password: customerSessionOptions.password,
      ttl: TTL_SECONDS,
    });
    if (data.purpose !== "login" || !data.email || !data.jti) return null;

    try {
      await prisma.magicLinkToken.create({ data: { jti: data.jti } });
    } catch {
      // Unique constraint violation — this token was already used.
      return null;
    }

    return data.email;
  } catch {
    return null;
  }
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
