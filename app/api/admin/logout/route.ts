import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, getAdminSession, shouldUseSecureAdminCookie } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST() {
  const session = await getAdminSession();

  if (session) {
    await prisma.adminAuditLog.create({
      data: {
        admin: session.email,
        action: "admin_logout",
        metadata: {
          source: "exam-admin",
        },
      },
    });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE_NAME, "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
    sameSite: "lax",
    secure: shouldUseSecureAdminCookie(),
  });

  return response;
}
