-- AlterTable
ALTER TABLE "User" ADD COLUMN     "needs_subscription" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "plan" DROP DEFAULT;
