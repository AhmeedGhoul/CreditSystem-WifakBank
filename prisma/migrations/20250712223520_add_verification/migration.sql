/*
  Warnings:

  - You are about to drop the column `deposit` on the `Contracts` table. All the data in the column will be lost.
  - Added the required column `period` to the `Contracts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Contracts" DROP COLUMN "deposit",
ADD COLUMN     "pdfUrl" TEXT,
ADD COLUMN     "period" INTEGER NOT NULL;
