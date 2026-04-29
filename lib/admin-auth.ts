import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE_NAME = "exam_admin_session";
const SESSION_MAX_AGE = 60 * 60 * 8;

function getSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || "dev-only-exam-admin-secret";
}

function sign(payload: string) {
  return createHmac("sha256", getSessionSecret()).update(payload).digest("base64url");
}

function safeCompare(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

export function isValidAdminPassword(password: string) {
  const expectedPassword = process.env.ADMIN_PASSWORD || "admin123";
  return safeCompare(password, expectedPassword);
}

export function createAdminSessionToken() {
  const payload = Buffer.from(
    JSON.stringify({
      role: "admin",
      email: "local-admin",
      expiresAt: Date.now() + SESSION_MAX_AGE * 1000,
    }),
  ).toString("base64url");

  return `${payload}.${sign(payload)}`;
}

export function verifyAdminSessionToken(token?: string) {
  if (!token) {
    return null;
  }

  const [payload, signature] = token.split(".");

  if (!payload || !signature || !safeCompare(signature, sign(payload))) {
    return null;
  }

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      role?: string;
      email?: string;
      expiresAt?: number;
    };

    if (parsed.role !== "admin" || typeof parsed.expiresAt !== "number" || parsed.expiresAt <= Date.now()) {
      return null;
    }

    return {
      email: parsed.email || "local-admin",
    };
  } catch {
    return null;
  }
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  return verifyAdminSessionToken(cookieStore.get(ADMIN_COOKIE_NAME)?.value);
}

export function shouldUseSecureAdminCookie() {
  if (process.env.ADMIN_COOKIE_SECURE) {
    return process.env.ADMIN_COOKIE_SECURE === "true";
  }

  return process.env.NODE_ENV === "production";
}

export function adminCookieOptions() {
  return {
    httpOnly: true,
    maxAge: SESSION_MAX_AGE,
    path: "/",
    sameSite: "lax" as const,
    secure: shouldUseSecureAdminCookie(),
  };
}
