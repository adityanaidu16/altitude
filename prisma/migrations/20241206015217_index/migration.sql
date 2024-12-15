-- DropIndex
DROP INDEX "Lead_userId_idx";

-- CreateIndex
CREATE INDEX "Lead_userId_status_idx" ON "Lead"("userId", "status");
