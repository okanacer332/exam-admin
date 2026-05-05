"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function UserSearch({ initialQuery }: { initialQuery: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialQuery);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const params = new URLSearchParams(searchParams.toString());
    const cleanQuery = query.trim();

    if (cleanQuery) {
      params.set("q", cleanQuery);
    } else {
      params.delete("q");
    }

    router.push(`/admin${params.toString() ? `?${params.toString()}` : ""}`);
  }

  return (
    <form className="user-search" onSubmit={handleSubmit}>
      <input
        aria-label="Kullanıcı ara"
        onChange={(event) => setQuery(event.target.value)}
        placeholder="E-posta veya ad ara"
        type="search"
        value={query}
      />
      <button type="submit">Ara</button>
      {initialQuery ? (
        <button className="ghost-button" onClick={() => router.push("/admin")} type="button">
          Temizle
        </button>
      ) : null}
    </form>
  );
}
