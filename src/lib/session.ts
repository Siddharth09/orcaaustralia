import { cookies } from "next/headers";
import { getIronSession, type SessionOptions } from "iron-session";

export interface AdminSessionData {
  isAdmin?: boolean;
}

export const sessionOptions: SessionOptions = {
  password: process.env.ADMIN_SESSION_SECRET ?? "",
  cookieName: "orca_admin_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  },
};

export async function getAdminSession() {
  const cookieStore = await cookies();
  return getIronSession<AdminSessionData>(cookieStore, sessionOptions);
}
