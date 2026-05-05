import type { DashboardData } from "@/lib/dashboard";
import { formatDate, formatNumber, getProgressPercent, getSettingValue } from "@/lib/format";
import { productPlans, roadmapPhases, topUpPlan } from "@/lib/plans";
import { AdminTabs, type AdminTab } from "./admin-tabs";
import { CreditControl } from "./credit-control";
import { LogoutButton } from "./logout-button";
import { PlanControl } from "./plan-control";
import { UserSearch } from "./user-search";

type AdminDashboardProps = {
  data?: DashboardData;
  errorMessage: string;
  searchQuery: string;
  session: {
    email: string;
  };
};

export function AdminDashboard({ data, errorMessage, searchQuery, session }: AdminDashboardProps) {
  if (errorMessage || !data) {
    return (
      <main className="admin-shell">
        <header className="admin-header">
          <div>
            <p className="eyebrow">Papirus AI Admin</p>
            <h1>Veritabanı bağlantısı bekleniyor.</h1>
            <p>{errorMessage || "Dashboard verisi alınamadı."}</p>
          </div>
          <LogoutButton />
        </header>
        <section className="warning-card">
          <h2>Kurulum notu</h2>
          <p>
            Admin paneli ana Papirus AI PostgreSQL veritabanına bağlanır. `.env` içinde
            <code> DATABASE_URL </code> tanımlandıktan sonra `npm run db:admin-schema` çalıştırarak admin log
            tablolarını oluştur.
          </p>
        </section>
      </main>
    );
  }

  const tabs: AdminTab[] = [
    {
      badge: formatNumber(data.totals.users),
      hint: "Genel metrikler",
      id: "dashboard",
      label: "Dashboard",
    },
    {
      badge: formatNumber(data.users.length),
      hint: "Kredi ve plan işlemleri",
      id: "users",
      label: "Kullanıcılar",
    },
    {
      badge: formatNumber(productPlans.length + 1),
      hint: "Paket ve kota yapısı",
      id: "plans",
      label: "Paketler",
    },
    {
      badge: formatNumber(data.recentFiles.length + data.recentSessions.length + data.recentProgress.length),
      hint: "Dosya, oturum ve işlem akışı",
      id: "logs",
      label: "Loglar",
    },
    {
      badge: formatNumber(roadmapPhases.length),
      hint: "Ürün fazları",
      id: "roadmap",
      label: "Yol Haritası",
    },
    {
      badge: formatNumber(data.auditLogs.length),
      hint: "Kritik panel işlemleri",
      id: "audit",
      label: "Audit",
    },
  ];

  return (
    <main className="admin-shell">
      <header className="admin-header">
        <div>
          <p className="eyebrow">Papirus AI Admin</p>
          <h1>Admin Dashboard</h1>
          <p>Aktif oturum: {session.email}</p>
        </div>
        <LogoutButton />
      </header>

      <AdminTabs tabs={tabs}>
        <section className="tab-stack">
          <section className="metric-grid">
            <MetricCard label="Toplam kullanıcı" value={formatNumber(data.totals.users)} />
            <MetricCard label="Doğrulanmış e-posta" value={formatNumber(data.totals.verifiedUsers)} />
            <MetricCard label=".edu.tr deneme adayı" value={formatNumber(data.totals.activeTrialCandidates)} />
            <MetricCard label="Toplam kredi bakiyesi" value={formatNumber(data.totals.credits)} />
          </section>
          <section className="panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Özet</p>
                <h2>Admin paneli kontrol merkezi.</h2>
              </div>
              <span className="pill">Aktif</span>
            </div>
            <div className="dashboard-summary">
              <SummaryCard label="Listelenen kullanıcı" value={formatNumber(data.users.length)} />
              <SummaryCard label="Son dosya" value={formatNumber(data.recentFiles.length)} />
              <SummaryCard label="Son oturum" value={formatNumber(data.recentSessions.length)} />
              <SummaryCard label="Kredi hareketi" value={formatNumber(data.creditEvents.length)} />
            </div>
          </section>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Kullanıcılar</p>
              <h2>Kredi tanımlama ve hesap ayrıntıları.</h2>
              <p className="panel-note">
                {searchQuery
                  ? `"${searchQuery}" için ${formatNumber(data.users.length)} kullanıcı listeleniyor.`
                  : "Son 100 kullanıcı listeleniyor. E-posta veya ad ile canlı veride arama yapabilirsiniz."}
              </p>
            </div>
            <UserSearch initialQuery={searchQuery} />
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Kullanıcı</th>
                  <th>Üniversite / Bölüm</th>
                  <th>Plan</th>
                  <th>Kredi</th>
                  <th>Dosya</th>
                  <th>Kayıt</th>
                  <th>Operasyon</th>
                </tr>
              </thead>
              <tbody>
                {data.users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <strong>{user.name}</strong>
                      <span>{user.email}</span>
                    </td>
                    <td>
                      <strong>{getSettingValue(user.settings, "profile_university")}</strong>
                      <span>{getSettingValue(user.settings, "profile_department")}</span>
                    </td>
                    <td>
                      <strong>{user.membershipPlan || "deneme / plansız"}</strong>
                      <span>{formatDate(user.membershipExpiresAt)}</span>
                    </td>
                    <td>
                      <strong>{formatNumber(user.aiBalance)}</strong>
                      <span>{user.email.endsWith(".edu.tr") ? ".edu.tr uygun" : "manuel kontrol"}</span>
                    </td>
                    <td>{formatNumber(user._count.files)}</td>
                    <td>{formatDate(user.createdAt)}</td>
                    <td>
                      <div className="operation-stack">
                        <PlanControl
                          currentCredits={user.aiBalance}
                          currentExpiresAt={user.membershipExpiresAt?.toISOString() || null}
                          currentPlan={user.membershipPlan}
                          userId={user.id}
                        />
                        <CreditControl currentBalance={user.aiBalance} userId={user.id} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Paketler</p>
              <h2>Deneme kotasını kontrollü tutuyoruz.</h2>
            </div>
            <span className="pill">Öneri: 15 kredi</span>
          </div>
          <div className="plan-grid">
            {productPlans.map((plan) => (
              <article className="plan-card" key={plan.code}>
                <span>{plan.name}</span>
                <h3>{plan.price}</h3>
                <p>{plan.period} · {formatNumber(plan.credits)} kredi · {plan.userLimit}</p>
                <small>{plan.positioning}</small>
                <ul>
                  {plan.guardrails.map((guardrail) => (
                    <li key={guardrail}>{guardrail}</li>
                  ))}
                </ul>
              </article>
            ))}
            <article className="plan-card topup">
              <span>{topUpPlan.name}</span>
              <h3>{topUpPlan.price}</h3>
              <p>{formatNumber(topUpPlan.credits)} kredi</p>
              <small>{topUpPlan.positioning}</small>
            </article>
          </div>
        </section>

        <section className="tab-stack">
          <section className="split-grid">
            <LogPanel title="Son dosyalar">
              {data.recentFiles.map((file) => (
                <LogItem
                  key={file.id}
                  meta={`${file.user.email} · ${formatDate(file.createdAt)}`}
                  title={file.filename}
                  value={file.path}
                />
              ))}
            </LogPanel>

            <LogPanel title="Son oturumlar">
              {data.recentSessions.map((sessionItem) => (
                <LogItem
                  key={sessionItem.id}
                  meta={`${sessionItem.user.email} · ${formatDate(sessionItem.updatedAt)}`}
                  title={sessionItem.ipAddress || "IP yok"}
                  value={sessionItem.userAgent || "User agent yok"}
                />
              ))}
            </LogPanel>
          </section>

          <section className="split-grid">
            <LogPanel title="İşlem progress logları">
              {data.recentProgress.map((progress) => (
                <LogItem
                  key={progress.id}
                  meta={`${progress.user.email} · ${formatDate(progress.createdAt)}`}
                  title={progress.type}
                  value={`${progress.current}/${progress.total} · %${getProgressPercent(progress.current, progress.total)}`}
                />
              ))}
            </LogPanel>

            <LogPanel title="Kredi hareketleri">
              {data.creditEvents.map((event) => (
                <LogItem
                  key={event.id}
                  meta={`${event.user.email} · ${formatDate(event.createdAt)}`}
                  title={`${event.action} · ${event.amount}`}
                  value={`${event.previousBalance} → ${event.newBalance}${event.note ? ` · ${event.note}` : ""}`}
                />
              ))}
            </LogPanel>
          </section>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Faz planı</p>
              <h2>Yeni feature yol haritası.</h2>
            </div>
          </div>
          <div className="phase-grid">
            {roadmapPhases.map((phase) => (
              <article className="phase-card" key={phase.phase}>
                <span>{phase.phase}</span>
                <h3>{phase.title}</h3>
                <p>{phase.outcome}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Admin audit</p>
              <h2>Panel içi kritik işlemler.</h2>
            </div>
          </div>
          <div className="log-list">
            {data.auditLogs.map((log) => (
              <LogItem
                key={log.id}
                meta={`${log.admin} · ${formatDate(log.createdAt)}`}
                title={log.action}
                value={log.target || "genel"}
              />
            ))}
          </div>
        </section>
      </AdminTabs>
    </main>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="metric-card">
      <strong>{value}</strong>
      <span>{label}</span>
    </article>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="summary-card">
      <strong>{value}</strong>
      <span>{label}</span>
    </article>
  );
}

function LogPanel({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <section className="panel compact">
      <div className="panel-heading">
        <h2>{title}</h2>
      </div>
      <div className="log-list">{children}</div>
    </section>
  );
}

function LogItem({ meta, title, value }: { meta: string; title: string; value: string }) {
  return (
    <article className="log-item">
      <div>
        <strong>{title}</strong>
        <span>{meta}</span>
      </div>
      <p>{value}</p>
    </article>
  );
}
