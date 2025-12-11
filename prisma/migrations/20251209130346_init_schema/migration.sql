-- CreateTable
CREATE TABLE "Agent" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "isLeader" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Agent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommissionConfig" (
    "id" SERIAL NOT NULL,
    "targetNd" DOUBLE PRECISION NOT NULL,
    "workingDays" INTEGER NOT NULL,
    "bmNetDeposit" DOUBLE PRECISION NOT NULL,
    "bmFtdCount" INTEGER NOT NULL,
    "bmFtdAmount" DOUBLE PRECISION NOT NULL,
    "bmNetRedeposit" DOUBLE PRECISION NOT NULL,
    "bmRedepClients" INTEGER NOT NULL,
    "bmCallsPerDay" INTEGER NOT NULL,
    "applyBase" TEXT NOT NULL,
    "bandsYour" TEXT NOT NULL,
    "bandsOpt" TEXT NOT NULL,
    "compositeAnchor" DOUBLE PRECISION NOT NULL,
    "compositeWeights" TEXT NOT NULL,
    "leaderBonusCap" DOUBLE PRECISION NOT NULL,
    "daysElapsed" INTEGER NOT NULL,
    "daysInMonth" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommissionConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentKpi" (
    "id" SERIAL NOT NULL,
    "agentId" INTEGER NOT NULL,
    "netDeposit" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ftdCount" INTEGER NOT NULL DEFAULT 0,
    "netRedeposit" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ftdAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "redepositClients" INTEGER NOT NULL DEFAULT 0,
    "callsMonth" INTEGER NOT NULL DEFAULT 0,
    "callsAvg" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "mgrBonus" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentKpi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditNote" (
    "id" SERIAL NOT NULL,
    "note" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuditNote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Agent_name_key" ON "Agent"("name");

-- AddForeignKey
ALTER TABLE "AgentKpi" ADD CONSTRAINT "AgentKpi_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
