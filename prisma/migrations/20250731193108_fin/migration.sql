-- CreateEnum
CREATE TYPE "ReplacementRequestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- CreateTable
CREATE TABLE "replacement_requests" (
    "id" SERIAL NOT NULL,
    "creditPoolId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "replacementEmail" VARCHAR(255) NOT NULL,
    "status" "ReplacementRequestStatus" NOT NULL DEFAULT 'PENDING',
    "confirmationToken" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "replacement_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "replacement_requests_confirmationToken_key" ON "replacement_requests"("confirmationToken");

-- AddForeignKey
ALTER TABLE "replacement_requests" ADD CONSTRAINT "replacement_requests_creditPoolId_fkey" FOREIGN KEY ("creditPoolId") REFERENCES "Credit_Pool"("creditPoolId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "replacement_requests" ADD CONSTRAINT "replacement_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
