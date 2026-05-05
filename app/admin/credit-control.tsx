"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type CreditMode = "add" | "subtract" | "set";

type CreditControlProps = {
  userId: string;
  currentBalance: number;
};

export function CreditControl({ userId, currentBalance }: CreditControlProps) {
  const router = useRouter();
  const [mode, setMode] = useState<CreditMode>("add");
  const [amount, setAmount] = useState("15");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const [isBusy, setIsBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsBusy(true);
    setMessage("");

    const response = await fetch(`/api/admin/users/${userId}/credits`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode,
        amount: Number(amount),
        note,
      }),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { message?: string } | null;
      setMessage(body?.message || "Kredi güncellenemedi.");
      setIsBusy(false);
      return;
    }

    setMessage("Kredi güncellendi.");
    setNote("");
    setIsBusy(false);
    router.refresh();
  }

  return (
    <form className="credit-form" onSubmit={handleSubmit}>
      <span>Mevcut: {currentBalance}</span>
      <select value={mode} onChange={(event) => setMode(event.target.value as CreditMode)}>
        <option value="add">Ekle</option>
        <option value="subtract">Eksilt</option>
        <option value="set">Ayarla</option>
      </select>
      <input min="0" max="100000" onChange={(event) => setAmount(event.target.value)} type="number" value={amount} />
      <input onChange={(event) => setNote(event.target.value)} placeholder="Not" value={note} />
      <button disabled={isBusy} type="submit">
        {isBusy ? "..." : "Uygula"}
      </button>
      {message ? <small>{message}</small> : null}
    </form>
  );
}
