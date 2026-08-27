import { cookies } from "next/headers";
import { getIronSession, type SessionOptions } from "iron-session";

export interface CustomerSessionData {
  email?: string;
}

export const customerSessionOptions: SessionOptions = {
  password:
    process.env.CUSTOMER_SESSION_SECRET || process.env.ADMIN_SESSION_SECRET || "",
  cookieName: "orca_customer_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  },
};

export async function getCustomerSession() {
  const cookieStore = await cookies();
  return getIronSession<CustomerSessionData>(cookieStore, customerSessionOptions);
}
