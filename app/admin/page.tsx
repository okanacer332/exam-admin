import { getAdminSession } from "@/lib/admin-auth";
import { getDashboardData } from "@/lib/dashboard";
import { AdminDashboard } from "./admin-dashboard";
import { LoginPanel } from "./login-panel";

export const dynamic = "force-dynamic";

type AdminPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getSingleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const params = searchParams ? await searchParams : {};
  const searchQuery = getSingleParam(params.q)?.trim() || "";
  const session = await getAdminSession();

  if (!session) {
    return <LoginPanel />;
  }

  let dashboardData;
  let errorMessage = "";

  try {
    dashboardData = await getDashboardData(searchQuery);
  } catch (error) {
    errorMessage =
      error instanceof Error
        ? error.message
        : "Veritabanına bağlanırken bilinmeyen bir hata oluştu.";
  }

  return <AdminDashboard data={dashboardData} errorMessage={errorMessage} searchQuery={searchQuery} session={session} />;
}
