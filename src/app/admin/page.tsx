import { prisma } from "@/lib/prisma";
import { computeMetrics } from "@/lib/commission";
import AdminClient from "./AdminClient";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
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

  const rows = agentMetrics.map((m) => ({
    agentId: m.agent.id,
    kpiId: m.kpi?.id ?? null,
    name: m.agent.name,
    isLeader: m.agent.isLeader,
    netDeposit: m.kpi?.netDeposit ?? 0,
    ftdCount: m.kpi?.ftdCount ?? 0,
    netRedeposit: m.kpi?.netRedeposit ?? 0,
    ftdAmount: m.kpi?.ftdAmount ?? 0,
    redepositClients: m.kpi?.redepositClients ?? 0,
    callsMonth: m.kpi?.callsMonth ?? 0,
    callsAvg: m.kpi?.callsAvg ?? 0,
    mgrBonus: m.kpi?.mgrBonus ?? 0,
    ndPts: m.ndPts,
    ftdPts: m.ftdPts,
    retPts: m.retPts,
    callsPts: m.callsPts,
    score: m.score,
  }));

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <AdminClient
          rows={rows}
          team={team}
          targetNd={config.targetNd}
          bandsYour={config.bandsYour}
          bandsOpt={config.bandsOpt}
        />
      </div>
    </main>
  );
}
