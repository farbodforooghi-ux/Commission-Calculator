import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RowPayload = {
  agentId: number;
  kpiId: number | null;
  netDeposit: number;
  ftdCount: number;
  netRedeposit: number;
  ftdAmount: number;
  redepositClients: number;
  callsMonth: number;
  callsAvg: number;
  mgrBonus: number;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { rows: RowPayload[] };

    if (!body.rows || !Array.isArray(body.rows)) {
      return NextResponse.json(
        { error: "Invalid payload" },
        { status: 400 }
      );
    }

    for (const row of body.rows) {
      const data = {
        netDeposit: Number(row.netDeposit) || 0,
        ftdCount: Number(row.ftdCount) || 0,
        netRedeposit: Number(row.netRedeposit) || 0,
        ftdAmount: Number(row.ftdAmount) || 0,
        redepositClients: Number(row.redepositClients) || 0,
        callsMonth: Number(row.callsMonth) || 0,
        callsAvg: Number(row.callsAvg) || 0,
        mgrBonus: Number(row.mgrBonus) || 0,
      };

      if (row.kpiId) {
        await prisma.agentKpi.update({
          where: { id: row.kpiId },
          data,
        });
      } else {
        await prisma.agentKpi.create({
          data: {
            agentId: row.agentId,
            ...data,
          },
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error saving KPIs", err);
    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 }
    );
  }
}
