/*
  Warnings:

  - You are about to drop the column `autoMessage` on the `Campaign` table. All the data in the column will be lost.
  - You are about to drop the column `dailyLimit` on the `Campaign` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Campaign" DROP COLUMN "autoMessage",
DROP COLUMN "dailyLimit";
