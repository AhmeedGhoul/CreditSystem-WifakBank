/*
  Warnings:

  - You are about to drop the column `isRequestApproved` on the `Request` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Request" DROP COLUMN "isRequestApproved",
ADD COLUMN     "isRequestApprovedByAgent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isRequestApprovedByAuditor" BOOLEAN NOT NULL DEFAULT false;
