import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  adminCookieOptions,
  createAdminSessionToken,
  isValidAdminPassword,
} from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { password?: string } | null;

  if (!body?.password || !isValidAdminPassword(body.password)) {
    return NextResponse.json({ message: "Admin şifresi hatalı." }, { status: 401 });
  }

  await prisma.adminAuditLog.create({
    data: {
      action: "admin_login",
      metadata: {
        source: "exam-admin",
      },
    },
  });

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE_NAME, createAdminSessionToken(), adminCookieOptions());

  return response;
}
