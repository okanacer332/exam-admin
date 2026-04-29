"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function LoginPanel() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isBusy, setIsBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsBusy(true);
    setMessage("");

    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { message?: string } | null;
      setMessage(body?.message || "GiriÅŸ yapÄ±lamadÄ±.");
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
          <h1>Operasyon paneline giriÅŸ yap.</h1>
          <p>
            Bu panel landing iÃ§erik dÃ¼zenlemez. KullanÄ±cÄ±, log, kredi ve paket operasyonunu izler.
            GeliÅŸtirme ÅŸifresi <strong>admin123</strong>; canlÄ±da ortam deÄŸiÅŸkeniyle deÄŸiÅŸtirilecek.
          </p>
        </div>
        <form onSubmit={handleSubmit}>
          <label htmlFor="password">Admin ÅŸifresi</label>
          <input
            id="password"
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Åifre"
            type="password"
            value={password}
          />
          <button disabled={isBusy} type="submit">
            {isBusy ? "Kontrol ediliyor..." : "GiriÅŸ yap"}
          </button>
          {message ? <p className="form-message">{message}</p> : null}
        </form>
      </section>
    </main>
  );
}
