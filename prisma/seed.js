require("dotenv").config();

const { PrismaClient } = require("../src/generated/prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Clear old data
  await prisma.agentKpi.deleteMany();
  await prisma.agent.deleteMany();
  await prisma.commissionConfig.deleteMany();
  await prisma.auditNote.deleteMany();

  // Seed agents
  await prisma.agent.createMany({
    data: [
      { name: "Lena" },
      { name: "Lida" },
      { name: "Lara" },
      { name: "Mahta" },
      { name: "Sophia", isLeader: true },
      { name: "Pegah" },
      { name: "Radin" },
    ],
  });

  // Seed commission config
  await prisma.commissionConfig.create({
    data: {
      targetNd: 300000,
      workingDays: 22,

      bmNetDeposit: 200000,
      bmFtdCount: 100,
      bmFtdAmount: 200000,
      bmNetRedeposit: 200000,
      bmRedepClients: 300,
      bmCallsPerDay: 60,

      applyBase: "composite",
      bandsYour: "75:0.01,91:0.02,101:0.03",
      bandsOpt: "0:0.005,60:0.01,75:0.015,90:0.02,100:0.025,121:0.03",
      compositeAnchor: 300000,
      compositeWeights: "20,20,20,20,20",
      leaderBonusCap: 1,

      daysElapsed: 16,
      daysInMonth: 31,
    },
  });

  console.log("✅ Seed completed");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
