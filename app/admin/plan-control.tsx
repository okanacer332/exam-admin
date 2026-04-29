"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { productPlans } from "@/lib/plans";

type PlanControlProps = {
  userId: string;
  currentPlan: string | null;
  currentCredits: number;
  currentExpiresAt: string | null;
};

const defaultsByPlan: Record<string, { credits: number; days: number }> = {
  poc: { credits: 15, days: 14 },
  individual: { credits: 1500, days: 365 },
  team: { credits: 6000, days: 365 },
};

function toDateInputValue(value: Date) {
  return value.toISOString().slice(0, 10);
}

function defaultExpiresAt(planCode: string) {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + (defaultsByPlan[planCode]?.days || 365));
  return toDateInputValue(expiresAt);
}

export function PlanControl({ userId, currentPlan, currentCredits, currentExpiresAt }: PlanControlProps) {
  const router = useRouter();
  const initialPlan = defaultsByPlan[currentPlan || ""] ? currentPlan || "poc" : "poc";
  const [planCode, setPlanCode] = useState(initialPlan);
  const [credits, setCredits] = useState(String(defaultsByPlan[initialPlan]?.credits ?? currentCredits));
  const [expiresAt, setExpiresAt] = useState(
    currentExpiresAt ? toDateInputValue(new Date(currentExpiresAt)) : defaultExpiresAt(initialPlan),
  );
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const [isBusy, setIsBusy] = useState(false);

  const selectedPlan = useMemo(() => productPlans.find((plan) => plan.code === planCode), [planCode]);

  function handlePlanChange(nextPlanCode: string) {
    setPlanCode(nextPlanCode);
    setCredits(String(defaultsByPlan[nextPlanCode]?.credits ?? 0));
    setExpiresAt(defaultExpiresAt(nextPlanCode));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsBusy(true);
    setMessage("");

    const response = await fetch(`/api/admin/users/${userId}/plan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        planCode,
        credits: Number(credits),
        expiresAt,
        note,
      }),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { message?: string } | null;
      setMessage(body?.message || "Paket atanamadı.");
      setIsBusy(false);
      return;
    }

    setMessage("Paket atandı.");
    setNote("");
    setIsBusy(false);
    router.refresh();
  }

  return (
    <form className="plan-form" onSubmit={handleSubmit}>
      <span>
        Mevcut: {currentPlan || "plansız"} / {currentCredits}
      </span>
      <select value={planCode} onChange={(event) => handlePlanChange(event.target.value)}>
        {productPlans.map((plan) => (
          <option key={plan.code} value={plan.code}>
            {plan.name}
          </option>
        ))}
      </select>
      <input min="0" max="100000" onChange={(event) => setCredits(event.target.value)} type="number" value={credits} />
      <input onChange={(event) => setExpiresAt(event.target.value)} type="date" value={expiresAt} />
      <input onChange={(event) => setNote(event.target.value)} placeholder="Paket notu" value={note} />
      <button disabled={isBusy} type="submit">
        {isBusy ? "..." : "Paket ata"}
      </button>
      <small>
        {message ||
          `${selectedPlan?.price || "Paket"} planı için kredi ve bitiş tarihi tek işlemde güncellenir.`}
      </small>
    </form>
  );
}
