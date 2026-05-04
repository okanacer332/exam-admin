"use client";

import { Children, ReactNode, useMemo, useState } from "react";

export type AdminTab = {
  badge?: string;
  hint: string;
  id: string;
  label: string;
};

type AdminTabsProps = {
  children: ReactNode;
  tabs: AdminTab[];
};

export function AdminTabs({ children, tabs }: AdminTabsProps) {
  const panels = useMemo(() => Children.toArray(children), [children]);
  const [activeId, setActiveId] = useState(tabs[0]?.id || "");
  const activeIndex = Math.max(
    0,
    tabs.findIndex((tab) => tab.id === activeId),
  );

  return (
    <div className="admin-tab-layout">
      <aside className="admin-tab-sidebar" aria-label="Admin bölümleri">
        <div className="admin-tab-sidebar-card">
          <p className="eyebrow">Admin Dashboard</p>
          <h2>Kontrol merkezi</h2>
          <p>Kullanıcı, kredi, paket ve log operasyonlarını ayrı sekmelerden yönet.</p>
        </div>

        <nav className="admin-tab-nav">
          {tabs.map((tab, index) => {
            const isActive = index === activeIndex;

            return (
              <button
                aria-current={isActive ? "page" : undefined}
                className={isActive ? "admin-tab-button active" : "admin-tab-button"}
                key={tab.id}
                onClick={() => setActiveId(tab.id)}
                type="button"
              >
                <span>
                  <strong>{tab.label}</strong>
                  <small>{tab.hint}</small>
                </span>
                {tab.badge ? <em>{tab.badge}</em> : null}
              </button>
            );
          })}
        </nav>
      </aside>

      <section className="admin-tab-content" aria-live="polite">
        {tabs.map((tab, index) => (
          <div className="admin-tab-panel" hidden={index !== activeIndex} key={tab.id}>
            {panels[index]}
          </div>
        ))}
      </section>
    </div>
  );
}
