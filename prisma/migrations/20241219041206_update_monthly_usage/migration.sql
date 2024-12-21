/*
  Warnings:

  - You are about to drop the `MonthlyUsage` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "MonthlyUsage" DROP CONSTRAINT "MonthlyUsage_userId_fkey";

-- DropTable
DROP TABLE "MonthlyUsage";
