import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const allowedPlans = {
  poc: "Proof of Concept",
  individual: "Bireysel Akademisyen",
  team: "Kürsü / Asistan Grubu",
} as const;

type RouteContext = {
  params: Promise<{
    userId: string;
  }>;
};

export async function POST(request: Request, context: RouteContext) {
  const admin = await getAdminSession();

  if (!admin) {
    return NextResponse.json({ message: "Yetkisiz işlem." }, { status: 401 });
  }

  const { userId } = await context.params;
  const body = (await request.json().catch(() => null)) as {
    planCode?: string;
    credits?: number;
    expiresAt?: string;
    note?: string;
  } | null;

  const planCode = body?.planCode || "";
  const credits = Number(body?.credits);

  if (!(planCode in allowedPlans)) {
    return NextResponse.json({ message: "Geçerli bir paket seçilmeli." }, { status: 400 });
  }

  if (!Number.isInteger(credits) || credits < 0 || credits > 100000) {
    return NextResponse.json({ message: "Kredi miktarı 0 ile 100000 arasında tam sayı olmalı." }, { status: 400 });
  }

  if (!body?.expiresAt) {
    return NextResponse.json({ message: "Paket bitiş tarihi zorunlu." }, { status: 400 });
  }

  const expiresAt = new Date(`${body.expiresAt}T23:59:59.000Z`);

  if (Number.isNaN(expiresAt.getTime())) {
    return NextResponse.json({ message: "Paket bitiş tarihi okunamadı." }, { status: 400 });
  }

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        aiBalance: true,
        membershipPlan: true,
        membershipExpiresAt: true,
      },
    });

    if (!user) {
      throw new Error("Kullanıcı bulunamadı.");
    }

    const previousBalance = user.aiBalance;

    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: {
        aiBalance: credits,
        membershipExpiresAt: expiresAt,
        membershipPlan: planCode,
      },
      select: {
        id: true,
        email: true,
        name: true,
        aiBalance: true,
        membershipExpiresAt: true,
        membershipPlan: true,
      },
    });

    await tx.adminCreditEvent.create({
      data: {
        userId,
        adminEmail: admin.email,
        action: "plan_credit_set",
        amount: credits,
        previousBalance,
        newBalance: credits,
        note: body?.note?.trim() || `${allowedPlans[planCode as keyof typeof allowedPlans]} paketi atandı.`,
      },
    });

    await tx.adminAuditLog.create({
      data: {
        admin: admin.email,
        action: "plan_assign",
        target: userId,
        metadata: {
          credits,
          expiresAt: expiresAt.toISOString(),
          nextPlan: planCode,
          previousBalance,
          previousExpiresAt: user.membershipExpiresAt?.toISOString() || null,
          previousPlan: user.membershipPlan,
        },
      },
    });

    return updatedUser;
  });

  return NextResponse.json(result);
}
