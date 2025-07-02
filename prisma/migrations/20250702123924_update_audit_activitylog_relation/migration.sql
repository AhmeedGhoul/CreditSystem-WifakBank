/*
  Warnings:

  - You are about to drop the column `activityLogId` on the `Audit` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Audit" DROP CONSTRAINT "Audit_activityLogId_fkey";

-- DropIndex
DROP INDEX "Audit_activityLogId_key";

-- AlterTable
ALTER TABLE "ActivityLog" ADD COLUMN     "auditId" INTEGER,
ALTER COLUMN "activityLogName" SET DATA TYPE TEXT,
ALTER COLUMN "ipAddress" SET DATA TYPE TEXT,
ALTER COLUMN "country" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Audit" DROP COLUMN "activityLogId";

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_auditId_fkey" FOREIGN KEY ("auditId") REFERENCES "Audit"("auditId") ON DELETE SET NULL ON UPDATE CASCADE;
