import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  adminCookieOptions,
  createAdminChallengeToken,
  createAdminSessionToken,
  isValidAdminChallengeAnswer,
  isValidAdminPassword,
  verifyAdminChallengeToken,
} from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    answer?: string;
    challengeToken?: string;
    password?: string;
    step?: "challenge" | "password";
  } | null;

  if (body?.step === "challenge") {
    if (!body.answer || !isValidAdminChallengeAnswer(body.answer)) {
      return NextResponse.json({ message: "İlk soru cevabı hatalı." }, { status: 401 });
    }

    return NextResponse.json({
      challengeToken: createAdminChallengeToken(),
      nextStep: "password",
      ok: true,
    });
  }

  if (body?.step !== "password" || !verifyAdminChallengeToken(body.challengeToken)) {
    return NextResponse.json({ message: "İlk soru doğrulaması süresi doldu. Baştan deneyin." }, { status: 401 });
  }

  if (!body.password || !isValidAdminPassword(body.password)) {
    return NextResponse.json({ message: "Admin şifresi hatalı." }, { status: 401 });
  }

  await prisma.adminAuditLog
    .create({
      data: {
        action: "admin_login",
        metadata: {
          source: "exam-admin",
        },
      },
    })
    .catch(() => null);

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE_NAME, createAdminSessionToken(), adminCookieOptions());

  return response;
}
