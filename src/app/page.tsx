import { prisma } from "@/lib/prisma";
import { computeMetrics } from "@/lib/commission";

function formatCurrency(n: number) {
  return n.toLocaleString(undefined, {
    maximumFractionDigits: 0,
  });
}

function formatPercent(n: number) {
  return n.toFixed(1) + "%";
}

export default async function DashboardPage() {
  const [config, agents] = await Promise.all([
    prisma.commissionConfig.findFirst({
      orderBy: { createdAt: "desc" },
    }),
    prisma.agent.findMany({
      where: { active: true },
      include: {
        kpis: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { id: "asc" },
    }),
  ]);

  if (!config) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <p>No commission configuration found.</p>
      </div>
    );
  }

  const { agentMetrics, team } = computeMetrics(config, agents);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <header className="border-b border-slate-800 pb-4">
          <h1 className="text-2xl font-bold">
            Forex Sales – Q4 Targets &amp; Commission Dashboard
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Read-only view for all agents. Data and rules managed by
            admin.
          </p>
        </header>

        {/* KPIs */}
        <section className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <p className="text-xs text-slate-400 uppercase">
              Monthly Target / Agent
            </p>
            <p className="text-xl font-semibold mt-1">
              ${formatCurrency(config.targetNd)}
            </p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <p className="text-xs text-slate-400 uppercase">
              Team Target (7)
            </p>
            <p className="text-xl font-semibold mt-1">
              ${formatCurrency(team.teamTarget)}
            </p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <p className="text-xs text-slate-400 uppercase">
              Team Net Deposit (Actual)
            </p>
            <p className="text-xl font-semibold mt-1">
              ${formatCurrency(team.teamAchieved)}
            </p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <p className="text-xs text-slate-400 uppercase">
              Avg Score
            </p>
            <p className="text-xl font-semibold mt-1">
              {team.avgScore.toFixed(1)}
            </p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <p className="text-xs text-slate-400 uppercase">
              Projected Net Deposit
            </p>
            <p className="text-xl font-semibold mt-1">
              ${formatCurrency(team.totalProjected)}
            </p>
          </div>
        </section>

        {/* Table */}
        <section className="rounded-xl border border-slate-800 bg-slate-900 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-900/80 border-b border-slate-800">
              <tr>
                <th className="px-3 py-2 text-left text-xs text-slate-400">
                  Agent
                </th>
                <th className="px-3 py-2 text-right text-xs text-slate-400">
                  Target $
                </th>
                <th className="px-3 py-2 text-right text-xs text-slate-400">
                  Achieved $
                </th>
                <th className="px-3 py-2 text-right text-xs text-slate-400">
                  % Target
                </th>
                <th className="px-3 py-2 text-right text-xs text-slate-400">
                  Score
                </th>
                <th className="px-3 py-2 text-right text-xs text-slate-400">
                  % Your
                </th>
                <th className="px-3 py-2 text-right text-xs text-slate-400">
                  $ Your
                </th>
                <th className="px-3 py-2 text-right text-xs text-slate-400">
                  % Opt
                </th>
                <th className="px-3 py-2 text-right text-xs text-slate-400">
                  $ Opt
                </th>
                <th className="px-3 py-2 text-right text-xs text-slate-400">
                  Projected $
                </th>
                <th className="px-3 py-2 text-right text-xs text-slate-400">
                  Pace
                </th>
                <th className="px-3 py-2 text-right text-xs text-slate-400">
                  Calls
                </th>
              </tr>
            </thead>
            <tbody>
              {agentMetrics.map((m) => (
                <tr
                  key={m.agent.id}
                  className="border-b border-slate-800/60"
                >
                  <td className="px-3 py-2 text-left">
                    {m.agent.name}
                    {m.agent.isLeader && (
                      <span className="ml-1 text-xs text-yellow-400">
                        ★
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right">
                    ${formatCurrency(m.targetNd)}
                  </td>
                  <td className="px-3 py-2 text-right">
                    ${formatCurrency(m.achievedNd)}
                  </td>
                  <td
                    className={
                      "px-3 py-2 text-right " +
                      (m.pctTarget >= 100
                        ? "text-emerald-400"
                        : m.pctTarget >= 75
                        ? "text-amber-400"
                        : "text-red-400")
                    }
                  >
                    {formatPercent(m.pctTarget)}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {m.score.toFixed(0)}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {formatPercent(m.yourPct * 100)}
                  </td>
                  <td className="px-3 py-2 text-right">
                    ${formatCurrency(m.yourComm)}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {formatPercent(m.optPct * 100)}
                  </td>
                  <td className="px-3 py-2 text-right">
                    ${formatCurrency(m.optComm)}
                  </td>
                  <td className="px-3 py-2 text-right">
                    ${formatCurrency(m.projectedNd)}
                  </td>
                  <td
                    className={
                      "px-3 py-2 text-right " +
                      (m.paceStatus === "On pace"
                        ? "text-emerald-400"
                        : "text-red-400")
                    }
                  >
                    {m.paceStatus}
                  </td>
                  <td
                    className={
                      "px-3 py-2 text-right " +
                      (m.callsStatus === "OK"
                        ? "text-emerald-400"
                        : "text-amber-400")
                    }
                  >
                    {m.callsStatus}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-900/80">
                <td className="px-3 py-2 text-left font-semibold">
                  Team Total
                </td>
                <td className="px-3 py-2 text-right font-semibold">
                  ${formatCurrency(team.teamTarget)}
                </td>
                <td className="px-3 py-2 text-right font-semibold">
                  ${formatCurrency(team.teamAchieved)}
                </td>
                <td className="px-3 py-2" />
                <td className="px-3 py-2 text-right font-semibold">
                  {team.avgScore.toFixed(1)}
                </td>
                <td className="px-3 py-2" />
                <td className="px-3 py-2 text-right font-semibold">
                  ${formatCurrency(team.totalYourComm)}
                </td>
                <td className="px-3 py-2" />
                <td className="px-3 py-2 text-right font-semibold">
                  ${formatCurrency(team.totalOptComm)}
                </td>
                <td className="px-3 py-2 text-right font-semibold">
                  ${formatCurrency(team.totalProjected)}
                </td>
                <td className="px-3 py-2" />
                <td className="px-3 py-2" />
              </tr>
            </tfoot>
          </table>
        </section>
      </div>
    </div>
  );
}
