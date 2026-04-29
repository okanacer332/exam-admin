import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

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
    mode?: "add" | "set";
    amount?: number;
    note?: string;
  } | null;

  const mode = body?.mode === "set" ? "set" : "add";
  const amount = Number(body?.amount);

  if (!Number.isInteger(amount) || amount < 0 || amount > 100000) {
    return NextResponse.json({ message: "Kredi miktarı 0 ile 100000 arasında tam sayı olmalı." }, { status: 400 });
  }

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        aiBalance: true,
      },
    });

    if (!user) {
      throw new Error("Kullanıcı bulunamadı.");
    }

    const previousBalance = user.aiBalance;
    const newBalance = mode === "set" ? amount : previousBalance + amount;

    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: {
        aiBalance: newBalance,
      },
      select: {
        id: true,
        email: true,
        name: true,
        aiBalance: true,
      },
    });

    await tx.adminCreditEvent.create({
      data: {
        userId,
        adminEmail: admin.email,
        action: mode === "set" ? "credit_set" : "credit_add",
        amount,
        previousBalance,
        newBalance,
        note: body?.note?.trim() || null,
      },
    });

    await tx.adminAuditLog.create({
      data: {
        admin: admin.email,
        action: mode === "set" ? "credit_set" : "credit_add",
        target: userId,
        metadata: {
          amount,
          previousBalance,
          newBalance,
        },
      },
    });

    return updatedUser;
  });

  return NextResponse.json(result);
}
