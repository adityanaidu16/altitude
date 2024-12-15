/*
  Warnings:

  - A unique constraint covering the columns `[linkedinUsername]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "linkedinProfile" JSONB,
ADD COLUMN     "linkedinUsername" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_linkedinUsername_key" ON "User"("linkedinUsername");
