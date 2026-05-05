import { prisma } from "@/lib/prisma";

export async function getDashboardData(searchQuery = "") {
  const cleanSearchQuery = searchQuery.trim();
  const userWhere = cleanSearchQuery
    ? {
        OR: [
          {
            email: {
              contains: cleanSearchQuery,
              mode: "insensitive" as const,
            },
          },
          {
            name: {
              contains: cleanSearchQuery,
              mode: "insensitive" as const,
            },
          },
        ],
      }
    : undefined;

  const [
    users,
    totalUsers,
    verifiedUsers,
    totalCredits,
    recentFiles,
    recentSessions,
    recentProgress,
    creditEvents,
    auditLogs,
  ] = await Promise.all([
    prisma.user.findMany({
      where: userWhere,
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        settings: {
          where: {
            code: {
              in: ["profile_university", "profile_department", "profile_onboarding_completed"],
            },
          },
        },
        _count: {
          select: {
            files: true,
            sessions: true,
            creditEvents: true,
          },
        },
      },
    }),
    prisma.user.count(),
    prisma.user.count({ where: { emailVerified: true } }),
    prisma.user.aggregate({ _sum: { aiBalance: true } }),
    prisma.file.findMany({
      orderBy: { createdAt: "desc" },
      take: 12,
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    }),
    prisma.session.findMany({
      orderBy: { updatedAt: "desc" },
      take: 12,
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    }),
    prisma.progress.findMany({
      orderBy: { createdAt: "desc" },
      take: 12,
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    }),
    prisma.adminCreditEvent.findMany({
      orderBy: { createdAt: "desc" },
      take: 15,
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    }),
    prisma.adminAuditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 15,
    }),
  ]);

  const activeTrialCandidates = users.filter((user) => user.email.endsWith(".edu.tr") && !user.membershipPlan).length;

  return {
    users,
    totals: {
      users: totalUsers,
      verifiedUsers,
      activeTrialCandidates,
      credits: totalCredits._sum.aiBalance || 0,
    },
    recentFiles,
    recentSessions,
    recentProgress,
    creditEvents,
    auditLogs,
  };
}

export type DashboardData = Awaited<ReturnType<typeof getDashboardData>>;
