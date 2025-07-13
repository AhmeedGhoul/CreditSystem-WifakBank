/*
  Warnings:

  - The `employmentStatus` column on the `Request` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Employment" AS ENUM ('Employed', 'Self_Employed', 'Unemployed', 'Student');

-- AlterTable
ALTER TABLE "Request" DROP COLUMN "employmentStatus",
ADD COLUMN     "employmentStatus" "Employment";
