"use client";

import { useState } from "react";
import type { TeamSummary } from "@/lib/commission";

type Row = {
  agentId: number;
  kpiId: number | null;
  name: string;
  isLeader: boolean;
  // editable
  netDeposit: number;
  ftdCount: number;
  netRedeposit: number;
  ftdAmount: number;
  redepositClients: number;
  callsMonth: number;
  callsAvg: number;
  mgrBonus: number;
  // read-only metrics
  ndPts: number;
  ftdPts: number;
  retPts: number;
  callsPts: number;
  score: number;
};

type Props = {
  rows: Row[];
  team: TeamSummary;
  targetNd: number;
  bandsYour: string | null;
  bandsOpt: string | null;
};

export default function AdminClient({
  rows: initialRows,
  team,
  targetNd,
  bandsYour,
  bandsOpt,
}: Props) {
  const [rows, setRows] = useState<Row[]>(initialRows);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  function updateField(
    index: number,
    field: keyof Row,
    value: string
  ) {
    setRows((prev) => {
      const copy = [...prev];
      const row = { ...copy[index] };
      (row as any)[field] = Number(value) || 0;
      copy[index] = row;
      return copy;
    });
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setOk(false);

    try {
      const res = await fetch("/api/admin/kpi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rows: rows.map((r) => ({
            agentId: r.agentId,
            kpiId: r.kpiId,
            netDeposit: r.netDeposit,
            ftdCount: r.ftdCount,
            netRedeposit: r.netRedeposit,
            ftdAmount: r.ftdAmount,
            redepositClients: r.redepositClients,
            callsMonth: r.callsMonth,
            callsAvg: r.callsAvg,
            mgrBonus: r.mgrBonus,
          })),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save");
      }

      setOk(true);
      window.location.reload();
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Unexpected error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="border-b border-slate-800 pb-3 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Admin – Commission Control Panel
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Only users with admin credentials can access this view. Use
            the table below to update KPIs for this month.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-md bg-blue-600 hover:bg-blue-500 text-sm font-semibold px-4 py-2 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-900 p-4 text-sm space-y-1">
        <p>
          <span className="text-slate-400">Target / Agent:</span>{" "}
          <span className="font-semibold">
            ${targetNd.toLocaleString()}
          </span>
        </p>
        <p>
          <span className="text-slate-400">Bands (Your):</span>{" "}
          <span className="font-mono">{bandsYour ?? "—"}</span>
        </p>
        <p>
          <span className="text-slate-400">Bands (Opt):</span>{" "}
          <span className="font-mono">{bandsOpt ?? "—"}</span>
        </p>
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-900 p-4 text-sm space-y-2">
        <p className="font-semibold">Quick summary</p>
        <p>
          Team Target:{" "}
          <span className="font-semibold">
            ${team.teamTarget.toLocaleString()}
          </span>{" "}
          | Team Achieved:{" "}
          <span className="font-semibold">
            ${team.teamAchieved.toLocaleString()}
          </span>{" "}
          | Avg Score:{" "}
          <span className="font-semibold">
            {team.avgScore.toFixed(1)}
          </span>
        </p>
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-900 p-4 text-sm">
        {error && (
          <p className="text-sm text-red-400 mb-2">{error}</p>
        )}
        {ok && !error && (
          <p className="text-sm text-emerald-400 mb-2">
            Saved. Reloading...
          </p>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-900/80 border-b border-slate-800">
              <tr>
                <th className="px-3 py-2 text-left text-xs text-slate-400">
                  Agent
                </th>
                <th className="px-3 py-2 text-right text-xs text-slate-400">
                  ND $
                </th>
                <th className="px-3 py-2 text-right text-xs text-slate-400">
                  FTD #
                </th>
                <th className="px-3 py-2 text-right text-xs text-slate-400">
                  Net Redep $
                </th>
                <th className="px-3 py-2 text-right text-xs text-slate-400">
                  FTD Amt $
                </th>
                <th className="px-3 py-2 text-right text-xs text-slate-400">
                  Redep cl.
                </th>
                <th className="px-3 py-2 text-right text-xs text-slate-400">
                  Calls m.
                </th>
                <th className="px-3 py-2 text-right text-xs text-slate-400">
                  Calls avg
                </th>
                <th className="px-3 py-2 text-right text-xs text-slate-400">
                  Mgr
                </th>
                <th className="px-3 py-2 text-right text-xs text-slate-400">
                  ND pts
                </th>
                <th className="px-3 py-2 text-right text-xs text-slate-400">
                  FTD pts
                </th>
                <th className="px-3 py-2 text-right text-xs text-slate-400">
                  Ret pts
                </th>
                <th className="px-3 py-2 text-right text-xs text-slate-400">
                  Calls pts
                </th>
                <th className="px-3 py-2 text-right text-xs text-slate-400">
                  Score
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, idx) => (
                <tr
                  key={r.agentId}
                  className="border-b border-slate-800/60 hover:bg-slate-900/70"
                >
                  <td className="px-3 py-2 text-left">
                    {r.name}
                    {r.isLeader && (
                      <span className="ml-1 text-xs text-yellow-400">
                        ★
                      </span>
                    )}
                  </td>

                  {(
                    [
                      "netDeposit",
                      "ftdCount",
                      "netRedeposit",
                      "ftdAmount",
                      "redepositClients",
                      "callsMonth",
                      "callsAvg",
                      "mgrBonus",
                    ] as const
                  ).map((field) => (
                    <td
                      key={field}
                      className="px-3 py-1 text-right align-middle"
                    >
                      <input
                        type="number"
                        className="w-24 rounded-md bg-slate-800 border border-slate-700 px-2 py-1 text-right text-xs"
                        value={r[field]}
                        onChange={(e) =>
                          updateField(idx, field, e.target.value)
                        }
                      />
                    </td>
                  ))}

                  <td className="px-3 py-2 text-right">
                    {r.ndPts.toFixed(2)}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {r.ftdPts.toFixed(2)}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {r.retPts.toFixed(2)}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {r.callsPts.toFixed(2)}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {r.score}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
