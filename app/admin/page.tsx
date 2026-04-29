import { getAdminSession } from "@/lib/admin-auth";
import { getDashboardData } from "@/lib/dashboard";
import { AdminDashboard } from "./admin-dashboard";
import { LoginPanel } from "./login-panel";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getAdminSession();

  if (!session) {
    return <LoginPanel />;
  }

  let dashboardData;
  let errorMessage = "";

  try {
    dashboardData = await getDashboardData();
  } catch (error) {
    errorMessage =
      error instanceof Error
        ? error.message
        : "Veritabanına bağlanırken bilinmeyen bir hata oluştu.";
  }

  return <AdminDashboard data={dashboardData} errorMessage={errorMessage} session={session} />;
}
