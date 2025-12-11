import type {
  Agent,
  AgentKpi,
  CommissionConfig,
} from "@/generated/prisma/client";

type Band = { th: number; rate: number };

function parseBands(str: string | null | undefined): Band[] {
  if (!str) return [];
  return str
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((p) => {
      const [th, rate] = p.split(":").map((x) => x.trim());
      return { th: Number(th), rate: Number(rate) };
    })
    .filter((b) => !Number.isNaN(b.th) && !Number.isNaN(b.rate))
    .sort((a, b) => a.th - b.th);
}

function getBandPercent(bands: Band[], score: number): number {
  let pct = 0;
  for (const b of bands) {
    if (score >= b.th) pct = b.rate;
  }
  return pct;
}

export type AgentMetrics = {
  agent: Agent;
  kpi: AgentKpi | null;
  targetNd: number;
  achievedNd: number;
  pctTarget: number;
  ndPts: number;
  ftdPts: number;
  retPts: number;
  callsPts: number;
  mgrBonus: number;
  score: number;
  yourPct: number;
  yourComm: number;
  optPct: number;
  optComm: number;
  projectedNd: number;
  paceStatus: "On pace" | "Behind";
  callsStatus: "OK" | "Below";
};

export type TeamSummary = {
  teamTarget: number;
  teamAchieved: number;
  avgScore: number;
  totalYourComm: number;
  totalOptComm: number;
  totalProjected: number;
};

export function computeMetrics(
  config: CommissionConfig,
  agents: (Agent & { kpis: AgentKpi[] })[]
): { agentMetrics: AgentMetrics[]; team: TeamSummary } {
  const {
    targetNd,
    workingDays,
    bmNetDeposit,
    bmFtdCount,
    bmFtdAmount,
    bmNetRedeposit,
    bmRedepClients,
    bmCallsPerDay,
    applyBase,
    bandsYour,
    bandsOpt,
    compositeAnchor,
    compositeWeights,
    leaderBonusCap,
    daysElapsed,
    daysInMonth,
  } = config;

  const bandsYourParsed = parseBands(bandsYour);
  const bandsOptParsed = parseBands(bandsOpt);

  const weightParts = (compositeWeights || "20,20,20,20,20")
    .split(",")
    .map((x) => Number(x.trim()));
  const [wFTDAmt, wFTDNum, wRetAmt, wRetNum, wCalls] =
    weightParts.length === 5 ? weightParts : [20, 20, 20, 20, 20];
  const wSum = wFTDAmt + wFTDNum + wRetAmt + wRetNum + wCalls || 100;

  const safeWorkingDays = Math.max(1, workingDays || 22);
  const safeDaysElapsed = Math.max(1, daysElapsed || 1);
  const safeDaysInMonth = Math.max(safeDaysElapsed, daysInMonth || 30);

  const results: AgentMetrics[] = [];

  let scoreSum = 0;
  let teamAch = 0;
  let teamCommYour = 0;
  let teamCommOpt = 0;
  let teamProj = 0;

  for (const agent of agents) {
    const kpi = agent.kpis[0] ?? null;

    const nd = kpi?.netDeposit ?? 0;
    const ftd = kpi?.ftdCount ?? 0;
    const netRedep = kpi?.netRedeposit ?? 0;
    const ftdAmt = kpi?.ftdAmount ?? 0;
    const redepClients = kpi?.redepositClients ?? 0;
    const callsMonth = kpi?.callsMonth ?? 0;
    const callsAvgExplicit = kpi?.callsAvg ?? 0;
    const mgrBonusRaw = kpi?.mgrBonus ?? 0;

    const avgCalls =
      callsAvgExplicit > 0
        ? callsAvgExplicit
        : callsMonth > 0
        ? callsMonth / safeWorkingDays
        : 0;

    const ndPts =
      Math.min(nd / Math.max(bmNetDeposit || 1, 1), 1) * 50;
    const ftdPts =
      Math.min(ftd / Math.max(bmFtdCount || 1, 1), 1) * 20;
    const retAmtPts =
      Math.min(netRedep / Math.max(bmNetRedeposit || 1, 1), 1) * 10;
    const retCntPts =
      Math.min(
        redepClients / Math.max(bmRedepClients || 1, 1),
        1
      ) * 10;
    const retentionPts = retAmtPts + retCntPts;
    const callsPts =
      Math.min(avgCalls / Math.max(bmCallsPerDay || 1, 1), 1) * 10;

    let mgrBonus = mgrBonusRaw;
    if (agent.isLeader) {
      mgrBonus = Math.min(mgrBonusRaw, leaderBonusCap ?? 1);
    }

    const rawScore =
      ndPts + ftdPts + retentionPts + callsPts + mgrBonus;
    const scoreCeil = Math.ceil(rawScore);

    // Commission base
    let commissionBase = 0;
    if (applyBase === "netDeposit") {
      commissionBase = nd;
    } else if (applyBase === "netRedeposit") {
      commissionBase = netRedep;
    } else {
      const ftdAmtNorm = Math.min(
        ftdAmt / Math.max(bmFtdAmount || 1, 1),
        1
      );
      const ftdNumNorm = Math.min(
        ftd / Math.max(bmFtdCount || 1, 1),
        1
      );
      const retAmtNorm = Math.min(
        netRedep / Math.max(bmNetRedeposit || 1, 1),
        1
      );
      const retNumNorm = Math.min(
        redepClients / Math.max(bmRedepClients || 1, 1),
        1
      );
      const callsNorm = Math.min(
        avgCalls / Math.max(bmCallsPerDay || 1, 1),
        1
      );

      const weighted =
        (ftdAmtNorm * wFTDAmt +
          ftdNumNorm * wFTDNum +
          retAmtNorm * wRetAmt +
          retNumNorm * wRetNum +
          callsNorm * wCalls) / Math.max(wSum, 1);

      commissionBase = weighted * (compositeAnchor || 300000);
    }

    const yourPct = getBandPercent(bandsYourParsed, scoreCeil);
    const optPct = getBandPercent(bandsOptParsed, scoreCeil);
    const yourComm = commissionBase * yourPct;
    const optComm = commissionBase * optPct;

    const projectedNd =
      nd > 0 && safeDaysElapsed > 0
        ? (nd / safeDaysElapsed) * safeDaysInMonth
        : 0;

    const paceOk = projectedNd >= targetNd;
    const callsOk = avgCalls >= bmCallsPerDay;

    teamAch += nd;
    scoreSum += scoreCeil;
    teamCommYour += yourComm;
    teamCommOpt += optComm;
    teamProj += projectedNd;

    results.push({
      agent,
      kpi,
      targetNd: targetNd,
      achievedNd: nd,
      pctTarget: targetNd > 0 ? (nd / targetNd) * 100 : 0,
      ndPts,
      ftdPts,
      retPts: retentionPts,
      callsPts,
      mgrBonus,
      score: scoreCeil,
      yourPct,
      yourComm,
      optPct,
      optComm,
      projectedNd,
      paceStatus: paceOk ? "On pace" : "Behind",
      callsStatus: callsOk ? "OK" : "Below",
    });
  }

  const team: TeamSummary = {
    teamTarget: targetNd * agents.length,
    teamAchieved: teamAch,
    avgScore: agents.length ? scoreSum / agents.length : 0,
    totalYourComm: teamCommYour,
    totalOptComm: teamCommOpt,
    totalProjected: teamProj,
  };

  return { agentMetrics: results, team };
}
