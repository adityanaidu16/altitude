/*
  Warnings:

  - Added the required column `usageId` to the `Lead` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PlanType" AS ENUM ('FREE', 'PLUS');

-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "usageId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "plan" "PlanType" NOT NULL DEFAULT 'FREE',
ADD COLUMN     "planEndDate" TIMESTAMP(3),
ADD COLUMN     "planStartDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "MonthlyUsage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "leadCount" INTEGER NOT NULL DEFAULT 0,
    "plan" "PlanType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MonthlyUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MonthlyUsage_userId_year_month_idx" ON "MonthlyUsage"("userId", "year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "MonthlyUsage_userId_year_month_key" ON "MonthlyUsage"("userId", "year", "month");

-- CreateIndex
CREATE INDEX "Lead_usageId_idx" ON "Lead"("usageId");

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_usageId_fkey" FOREIGN KEY ("usageId") REFERENCES "MonthlyUsage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthlyUsage" ADD CONSTRAINT "MonthlyUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
