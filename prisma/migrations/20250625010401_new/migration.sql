-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('Admin', 'Client', 'Agent', 'Auditor');

-- CreateEnum
CREATE TYPE "AuditStatus" AS ENUM ('PENDING', 'Paused', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "CivilStatus" AS ENUM ('Married', 'Divorced', 'Single', 'Widow');

-- CreateEnum
CREATE TYPE "FraudCaseType" AS ENUM ('IDENTITY_THEFT', 'ACCOUNT_TAKEOVER', 'FAKE_DOCUMENT');

-- CreateEnum
CREATE TYPE "AuditType" AS ENUM ('Finacial', 'compliance', 'Risk');

-- CreateEnum
CREATE TYPE "CaseStatus" AS ENUM ('OPEN', 'CLOSED', 'UNDER_INVESTIGATION');

-- CreateTable
CREATE TABLE "User" (
    "userId" SERIAL NOT NULL,
    "firstName" VARCHAR(100) NOT NULL,
    "lastName" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "age" INTEGER NOT NULL DEFAULT 18,
    "adress" TEXT NOT NULL,
    "phoneNumber" INTEGER NOT NULL,
    "userScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "civilStatus" "CivilStatus" NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "isAccountBlocked" BOOLEAN NOT NULL DEFAULT false,
    "createdDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastModifiedDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Audit" (
    "auditId" SERIAL NOT NULL,
    "auditStatus" "AuditStatus" NOT NULL,
    "auditOutput" TEXT NOT NULL,
    "auditDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "auditType" "AuditType" NOT NULL,
    "activityLogId" INTEGER NOT NULL,

    CONSTRAINT "Audit_pkey" PRIMARY KEY ("auditId")
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "activityLogId" SERIAL NOT NULL,
    "activityLogName" VARCHAR(255) NOT NULL,
    "activityLogDescription" TEXT NOT NULL,
    "activityDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" VARCHAR(45) NOT NULL,
    "country" VARCHAR(100) NOT NULL,
    "userUserId" INTEGER,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("activityLogId")
);

-- CreateTable
CREATE TABLE "Fraud_Case" (
    "fraudCaseId" SERIAL NOT NULL,
    "fraudCaseType" "FraudCaseType" NOT NULL,
    "detectionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "caseStatus" "CaseStatus" NOT NULL,
    "auditId" INTEGER,

    CONSTRAINT "Fraud_Case_pkey" PRIMARY KEY ("fraudCaseId")
);

-- CreateTable
CREATE TABLE "Document" (
    "documentId" SERIAL NOT NULL,
    "documentDate" TIMESTAMP(3) NOT NULL,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "requestId" INTEGER,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("documentId")
);

-- CreateTable
CREATE TABLE "Request" (
    "requestId" SERIAL NOT NULL,
    "requestDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isRequestApproved" BOOLEAN NOT NULL DEFAULT false,
    "userUserId" INTEGER,

    CONSTRAINT "Request_pkey" PRIMARY KEY ("requestId")
);

-- CreateTable
CREATE TABLE "Credit_Pool_Payment" (
    "creditPoolPaymentId" SERIAL NOT NULL,
    "date" VARCHAR(50) NOT NULL,
    "amount" VARCHAR(50) NOT NULL,
    "contractId" INTEGER,

    CONSTRAINT "Credit_Pool_Payment_pkey" PRIMARY KEY ("creditPoolPaymentId")
);

-- CreateTable
CREATE TABLE "Contracts" (
    "contractId" SERIAL NOT NULL,
    "contractDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "amount" DOUBLE PRECISION NOT NULL,
    "deposit" DOUBLE PRECISION NOT NULL,
    "userUserId" INTEGER,
    "creditPoolId" INTEGER,

    CONSTRAINT "Contracts_pkey" PRIMARY KEY ("contractId")
);

-- CreateTable
CREATE TABLE "Credit_Pool" (
    "creditPoolId" SERIAL NOT NULL,
    "minValue" DOUBLE PRECISION NOT NULL,
    "maxValue" DOUBLE PRECISION NOT NULL,
    "isFull" BOOLEAN NOT NULL DEFAULT false,
    "numberOfPeople" INTEGER NOT NULL DEFAULT 0,
    "openDate" TIMESTAMP(3) NOT NULL,
    "closeDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Credit_Pool_pkey" PRIMARY KEY ("creditPoolId")
);

-- CreateTable
CREATE TABLE "Garent" (
    "garentId" SERIAL NOT NULL,
    "firstName" VARCHAR(100) NOT NULL,
    "lastName" VARCHAR(100) NOT NULL,
    "phoneNumber" INTEGER NOT NULL,
    "userUserId" INTEGER,

    CONSTRAINT "Garent_pkey" PRIMARY KEY ("garentId")
);

-- CreateTable
CREATE TABLE "Account" (
    "accountId" SERIAL NOT NULL,
    "openDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "trackingNumber" INTEGER NOT NULL,
    "linkedUserId" INTEGER NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("accountId")
);

-- CreateTable
CREATE TABLE "Account_Payment" (
    "paymentId" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "method" VARCHAR(50) NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "accountId" INTEGER NOT NULL,

    CONSTRAINT "Account_Payment_pkey" PRIMARY KEY ("paymentId")
);

-- CreateTable
CREATE TABLE "_UserRoles" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_UserRoles_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Audit_activityLogId_key" ON "Audit"("activityLogId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_trackingNumber_key" ON "Account"("trackingNumber");

-- CreateIndex
CREATE INDEX "_UserRoles_B_index" ON "_UserRoles"("B");

-- AddForeignKey
ALTER TABLE "Audit" ADD CONSTRAINT "Audit_activityLogId_fkey" FOREIGN KEY ("activityLogId") REFERENCES "ActivityLog"("activityLogId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_userUserId_fkey" FOREIGN KEY ("userUserId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fraud_Case" ADD CONSTRAINT "Fraud_Case_auditId_fkey" FOREIGN KEY ("auditId") REFERENCES "Audit"("auditId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "Request"("requestId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_userUserId_fkey" FOREIGN KEY ("userUserId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Credit_Pool_Payment" ADD CONSTRAINT "Credit_Pool_Payment_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contracts"("contractId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contracts" ADD CONSTRAINT "Contracts_userUserId_fkey" FOREIGN KEY ("userUserId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contracts" ADD CONSTRAINT "Contracts_creditPoolId_fkey" FOREIGN KEY ("creditPoolId") REFERENCES "Credit_Pool"("creditPoolId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Garent" ADD CONSTRAINT "Garent_userUserId_fkey" FOREIGN KEY ("userUserId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_linkedUserId_fkey" FOREIGN KEY ("linkedUserId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account_Payment" ADD CONSTRAINT "Account_Payment_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("accountId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserRoles" ADD CONSTRAINT "_UserRoles_A_fkey" FOREIGN KEY ("A") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserRoles" ADD CONSTRAINT "_UserRoles_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
