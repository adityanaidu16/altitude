-- CreateTable
CREATE TABLE "DeletedLead" (
    "id" TEXT NOT NULL,
    "originalLeadId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "monthlyUsageId" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeletedLead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DeletedLead_userId_idx" ON "DeletedLead"("userId");

-- CreateIndex
CREATE INDEX "DeletedLead_monthlyUsageId_idx" ON "DeletedLead"("monthlyUsageId");

-- AddForeignKey
ALTER TABLE "DeletedLead" ADD CONSTRAINT "DeletedLead_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeletedLead" ADD CONSTRAINT "DeletedLead_monthlyUsageId_fkey" FOREIGN KEY ("monthlyUsageId") REFERENCES "MonthlyUsage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
