-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('UNVERIFIED', 'PENDING', 'VERIFIED', 'FAILED', 'UNKNOWN');

-- AlterTable
ALTER TABLE "TaxReturn" ADD COLUMN     "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'UNVERIFIED';

-- CreateTable
CREATE TABLE "VerificationAttempt" (
    "id" TEXT NOT NULL,
    "taxReturnId" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "providerReference" TEXT,
    "errorCategory" TEXT,
    "errorDetail" TEXT,

    CONSTRAINT "VerificationAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VerificationAttempt_taxReturnId_idx" ON "VerificationAttempt"("taxReturnId");

-- CreateIndex
CREATE INDEX "VerificationAttempt_status_idx" ON "VerificationAttempt"("status");

-- CreateIndex
CREATE INDEX "TaxReturn_verificationStatus_idx" ON "TaxReturn"("verificationStatus");

-- AddForeignKey
ALTER TABLE "VerificationAttempt" ADD CONSTRAINT "VerificationAttempt_taxReturnId_fkey" FOREIGN KEY ("taxReturnId") REFERENCES "TaxReturn"("id") ON DELETE CASCADE ON UPDATE CASCADE;
