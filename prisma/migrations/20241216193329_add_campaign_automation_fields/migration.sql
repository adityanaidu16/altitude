-- AlterTable
ALTER TABLE "Campaign" ADD COLUMN     "autoApprove" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "autoMessage" BOOLEAN NOT NULL DEFAULT false;
