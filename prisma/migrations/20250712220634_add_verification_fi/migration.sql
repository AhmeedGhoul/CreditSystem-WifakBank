/*
  Warnings:

  - You are about to drop the column `closeDate` on the `Credit_Pool` table. All the data in the column will be lost.
  - You are about to drop the column `maxValue` on the `Credit_Pool` table. All the data in the column will be lost.
  - You are about to drop the column `minValue` on the `Credit_Pool` table. All the data in the column will be lost.
  - You are about to drop the column `numberOfPeople` on the `Credit_Pool` table. All the data in the column will be lost.
  - You are about to drop the column `openDate` on the `Credit_Pool` table. All the data in the column will be lost.
  - Added the required column `FinalValue` to the `Credit_Pool` table without a default value. This is not possible if the table is not empty.
  - Added the required column `maxPeople` to the `Credit_Pool` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Credit_Pool" DROP COLUMN "closeDate",
DROP COLUMN "maxValue",
DROP COLUMN "minValue",
DROP COLUMN "numberOfPeople",
DROP COLUMN "openDate",
ADD COLUMN     "FinalValue" INTEGER NOT NULL,
ADD COLUMN     "Frequency" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "Period" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN     "maxPeople" INTEGER NOT NULL;
