import type { DashboardData } from "@/lib/dashboard";
import { formatDate, formatNumber, getProgressPercent, getSettingValue } from "@/lib/format";
import { productPlans, roadmapPhases, topUpPlan } from "@/lib/plans";
import { CreditControl } from "./credit-control";
import { LogoutButton } from "./logout-button";
import { PlanControl } from "./plan-control";

type AdminDashboardProps = {
  data?: DashboardData;
  errorMessage: string;
  session: {
    email: string;
  };
};

export function AdminDashboard({ data, errorMessage, session }: AdminDashboardProps) {
  if (errorMessage || !data) {
    return (
      <main className="admin-shell">
        <header className="admin-header">
          <div>
            <p className="eyebrow">Papirus AI Admin</p>
            <h1>VeritabanÄ± baÄŸlantÄ±sÄ± bekleniyor.</h1>
            <p>{errorMessage || "Dashboard verisi alÄ±namadÄ±."}</p>
          </div>
          <LogoutButton />
        </header>
        <section className="warning-card">
          <h2>Kurulum notu</h2>
          <p>
            Admin paneli ana Papirus AI PostgreSQL veritabanÄ±na baÄŸlanÄ±r. `.env` iÃ§inde
            <code> DATABASE_URL </code> tanÄ±mlandÄ±ktan sonra `npm run db:admin-schema` Ã§alÄ±ÅŸtÄ±rarak admin log
            tablolarÄ±nÄ± oluÅŸtur.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="admin-shell">
      <header className="admin-header">
        <div>
          <p className="eyebrow">Papirus AI Admin</p>
          <h1>KullanÄ±cÄ±, kredi ve operasyon gÃ¶rÃ¼nÃ¼mÃ¼.</h1>
          <p>Aktif oturum: {session.email}</p>
        </div>
        <LogoutButton />
      </header>

      <section className="metric-grid">
        <MetricCard label="Toplam kullanÄ±cÄ±" value={formatNumber(data.totals.users)} />
        <MetricCard label="DoÄŸrulanmÄ±ÅŸ e-posta" value={formatNumber(data.totals.verifiedUsers)} />
        <MetricCard label=".edu.tr deneme adayÄ±" value={formatNumber(data.totals.activeTrialCandidates)} />
        <MetricCard label="Toplam kredi bakiyesi" value={formatNumber(data.totals.credits)} />
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Plan kararÄ±</p>
            <h2>Deneme kotasÄ±nÄ± kontrollÃ¼ tutuyoruz.</h2>
          </div>
          <span className="pill">Ã–neri: 15 kredi</span>
        </div>
        <div className="plan-grid">
          {productPlans.map((plan) => (
            <article className="plan-card" key={plan.code}>
              <span>{plan.name}</span>
              <h3>{plan.price}</h3>
              <p>{plan.period} Â· {formatNumber(plan.credits)} kredi Â· {plan.userLimit}</p>
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

      <section className="panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">KullanÄ±cÄ±lar</p>
            <h2>Kredi tanÄ±mlama ve hesap ayrÄ±ntÄ±larÄ±.</h2>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>KullanÄ±cÄ±</th>
                <th>Ãœniversite / BÃ¶lÃ¼m</th>
                <th>Plan</th>
                <th>Kredi</th>
                <th>Dosya</th>
                <th>KayÄ±t</th>
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
                    <strong>{user.membershipPlan || "deneme / plansÄ±z"}</strong>
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

      <section className="split-grid">
        <LogPanel title="Son dosyalar">
          {data.recentFiles.map((file) => (
            <LogItem
              key={file.id}
              meta={`${file.user.email} Â· ${formatDate(file.createdAt)}`}
              title={file.filename}
              value={file.path}
            />
          ))}
        </LogPanel>

        <LogPanel title="Son oturumlar">
          {data.recentSessions.map((sessionItem) => (
            <LogItem
              key={sessionItem.id}
              meta={`${sessionItem.user.email} Â· ${formatDate(sessionItem.updatedAt)}`}
              title={sessionItem.ipAddress || "IP yok"}
              value={sessionItem.userAgent || "User agent yok"}
            />
          ))}
        </LogPanel>
      </section>

      <section className="split-grid">
        <LogPanel title="Ä°ÅŸlem progress loglarÄ±">
          {data.recentProgress.map((progress) => (
            <LogItem
              key={progress.id}
              meta={`${progress.user.email} Â· ${formatDate(progress.createdAt)}`}
              title={progress.type}
              value={`${progress.current}/${progress.total} Â· %${getProgressPercent(progress.current, progress.total)}`}
            />
          ))}
        </LogPanel>

        <LogPanel title="Kredi hareketleri">
          {data.creditEvents.map((event) => (
            <LogItem
              key={event.id}
              meta={`${event.user.email} Â· ${formatDate(event.createdAt)}`}
              title={`${event.action} Â· ${event.amount}`}
              value={`${event.previousBalance} â†’ ${event.newBalance}${event.note ? ` Â· ${event.note}` : ""}`}
            />
          ))}
        </LogPanel>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Faz planÄ±</p>
            <h2>Yeni feature yol haritasÄ±.</h2>
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
            <h2>Panel iÃ§i kritik iÅŸlemler.</h2>
          </div>
        </div>
        <div className="log-list">
          {data.auditLogs.map((log) => (
            <LogItem
              key={log.id}
              meta={`${log.admin} Â· ${formatDate(log.createdAt)}`}
              title={log.action}
              value={log.target || "genel"}
            />
          ))}
        </div>
      </section>
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
