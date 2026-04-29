"use client";

import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh();
  }

  return (
    <button className="ghost-button" onClick={handleLogout} type="button">
      Çıkış yap
    </button>
  );
}
