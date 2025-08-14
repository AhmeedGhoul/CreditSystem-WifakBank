/*
  Warnings:

  - You are about to drop the `Fraud_Case` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Fraud_Case" DROP CONSTRAINT "Fraud_Case_auditId_fkey";

-- DropTable
DROP TABLE "Fraud_Case";

-- DropEnum
DROP TYPE "CaseStatus";

-- DropEnum
DROP TYPE "FraudCaseType";
