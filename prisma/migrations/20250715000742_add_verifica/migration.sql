/*
  Warnings:

  - You are about to drop the column `date` on the `Credit_Pool_Payment` table. All the data in the column will be lost.
  - You are about to drop the `Account_Payment` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `MaximumDate` to the `Credit_Pool_Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `PaymentDate` to the `Credit_Pool_Payment` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Account_Payment" DROP CONSTRAINT "Account_Payment_accountId_fkey";

-- AlterTable
ALTER TABLE "Credit_Pool_Payment" DROP COLUMN "date",
ADD COLUMN     "MaximumDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "PaymentDate" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "Account_Payment";
