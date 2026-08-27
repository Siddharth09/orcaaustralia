import { sealData, unsealData } from "iron-session";
import { customerSessionOptions } from "@/lib/customerSession";

const TTL_SECONDS = 30 * 60;

interface MagicLinkPayload {
  email: string;
  purpose: "login";
}

export async function createMagicLinkToken(email: string) {
  const payload: MagicLinkPayload = { email, purpose: "login" };
  return sealData(payload, {
    password: customerSessionOptions.password,
    ttl: TTL_SECONDS,
  });
}

export async function verifyMagicLinkToken(token: string) {
  try {
    const data = await unsealData<MagicLinkPayload>(token, {
      password: customerSessionOptions.password,
      ttl: TTL_SECONDS,
    });
    if (data.purpose !== "login" || !data.email) return null;
    return data.email;
  } catch {
    return null;
  }
}
