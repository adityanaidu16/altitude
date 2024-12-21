/*
  Warnings:

  - You are about to drop the column `leadCount` on the `MonthlyUsage` table. All the data in the column will be lost.
  - You are about to drop the `DeletedLead` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Lead` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "DeletedLead" DROP CONSTRAINT "DeletedLead_monthlyUsageId_fkey";

-- DropForeignKey
ALTER TABLE "DeletedLead" DROP CONSTRAINT "DeletedLead_userId_fkey";

-- DropForeignKey
ALTER TABLE "Lead" DROP CONSTRAINT "Lead_usageId_fkey";

-- DropForeignKey
ALTER TABLE "Lead" DROP CONSTRAINT "Lead_userId_fkey";

-- AlterTable
ALTER TABLE "MonthlyUsage" DROP COLUMN "leadCount",
ADD COLUMN     "campaignCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "connectionsCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "messagesSent" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "prospectCount" INTEGER NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "DeletedLead";

-- DropTable
DROP TABLE "Lead";
