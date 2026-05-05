import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type CreditMode = "add" | "subtract" | "set";

type RouteContext = {
  params: Promise<{
    userId: string;
  }>;
};

function getCreditMode(value: unknown): CreditMode {
  if (value === "set") return "set";
  if (value === "subtract") return "subtract";
  return "add";
}

function getCreditAction(mode: CreditMode) {
  if (mode === "set") return "credit_set";
  if (mode === "subtract") return "credit_subtract";
  return "credit_add";
}

export async function POST(request: Request, context: RouteContext) {
  const admin = await getAdminSession();

  if (!admin) {
    return NextResponse.json({ message: "Yetkisiz işlem." }, { status: 401 });
  }

  const { userId } = await context.params;
  const body = (await request.json().catch(() => null)) as {
    mode?: CreditMode;
    amount?: number;
    note?: string;
  } | null;

  const mode = getCreditMode(body?.mode);
  const amount = Number(body?.amount);

  if (!Number.isInteger(amount) || amount < 0 || amount > 100000) {
    return NextResponse.json({ message: "Kredi miktarı 0 ile 100000 arasında tam sayı olmalı." }, { status: 400 });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          aiBalance: true,
        },
      });

      if (!user) {
        return { error: "Kullanıcı bulunamadı.", status: 404 as const };
      }

      const previousBalance = user.aiBalance;
      const newBalance =
        mode === "set" ? amount : mode === "subtract" ? previousBalance - amount : previousBalance + amount;

      if (newBalance < 0) {
        return {
          error: `Kredi bakiyesi 0 altına düşemez. Mevcut bakiye: ${previousBalance}.`,
          status: 400 as const,
        };
      }

      const action = getCreditAction(mode);
      const signedAmount = mode === "subtract" ? -amount : amount;

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
          action,
          amount: signedAmount,
          previousBalance,
          newBalance,
          note: body?.note?.trim() || null,
        },
      });

      await tx.adminAuditLog.create({
        data: {
          admin: admin.email,
          action,
          target: userId,
          metadata: {
            amount: signedAmount,
            mode,
            previousBalance,
            newBalance,
          },
        },
      });

      return { user: updatedUser };
    });

    if ("error" in result) {
      return NextResponse.json({ message: result.error }, { status: result.status });
    }

    return NextResponse.json(result.user);
  } catch (error) {
    console.error("[ADMIN CREDIT UPDATE ERROR]", error);
    return NextResponse.json({ message: "Kredi güncellenemedi." }, { status: 500 });
  }
}
