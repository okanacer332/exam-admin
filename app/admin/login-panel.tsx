"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function LoginPanel() {
  const router = useRouter();
  const [answer, setAnswer] = useState("");
  const [challengeToken, setChallengeToken] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [step, setStep] = useState<"challenge" | "password">("challenge");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsBusy(true);
    setMessage("");

    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        step === "challenge"
          ? {
              answer,
              step,
            }
          : {
              challengeToken,
              password,
              step,
            },
      ),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { message?: string } | null;
      setMessage(body?.message || "Giriş yapılamadı.");
      setIsBusy(false);
      return;
    }

    if (step === "challenge") {
      const body = (await response.json().catch(() => null)) as { challengeToken?: string } | null;

      if (!body?.challengeToken) {
        setMessage("İlk adım tamamlandı ama doğrulama anahtarı alınamadı.");
        setIsBusy(false);
        return;
      }

      setChallengeToken(body.challengeToken);
      setStep("password");
      setPassword("");
      setMessage("");
      setIsBusy(false);
      return;
    }

    router.refresh();
  }

  return (
    <main className="login-shell">
      <section className="login-card">
        <div>
          <p className="eyebrow">Papirus AI Admin</p>
          <h1>Operasyon paneline giriş yap.</h1>
          <p>
            Bu panel landing içerik düzenlemez. Kullanıcı, log, kredi ve paket operasyonunu izler. Giriş iki adımlıdır
            ve tüm bilgiler ortam değişkenlerinden okunur.
          </p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="login-step">
            <span className={step === "challenge" ? "active" : ""}>1. Soru</span>
            <span className={step === "password" ? "active" : ""}>2. Şifre</span>
          </div>

          {step === "challenge" ? (
            <>
              <label htmlFor="answer">Aklına gelen hayvan?</label>
              <input
                autoComplete="off"
                autoFocus
                id="answer"
                onChange={(event) => setAnswer(event.target.value)}
                placeholder="Cevap"
                type="text"
                value={answer}
              />
            </>
          ) : (
            <>
              <label htmlFor="password">Admin şifresi</label>
              <input
                autoComplete="current-password"
                autoFocus
                id="password"
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Şifre"
                type="password"
                value={password}
              />
            </>
          )}

          <button disabled={isBusy} type="submit">
            {isBusy ? "Kontrol ediliyor..." : step === "challenge" ? "Devam et" : "Giriş yap"}
          </button>
          {message ? <p className="form-message">{message}</p> : null}
        </form>
      </section>
    </main>
  );
}
