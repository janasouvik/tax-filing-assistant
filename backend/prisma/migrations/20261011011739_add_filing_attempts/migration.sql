-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "TaxReturnStatus" ADD VALUE 'SUBMISSION_FAILED';
ALTER TYPE "TaxReturnStatus" ADD VALUE 'SUBMISSION_UNKNOWN';

-- CreateTable
CREATE TABLE "FilingAttempt" (
    "id" TEXT NOT NULL,
    "taxReturnId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "dispatchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),
    "ackNumber" TEXT,
    "transactionId" TEXT,
    "errorCategory" TEXT,
    "errorDetail" TEXT,

    CONSTRAINT "FilingAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FilingAttempt_taxReturnId_idx" ON "FilingAttempt"("taxReturnId");

-- CreateIndex
CREATE INDEX "FilingAttempt_status_idx" ON "FilingAttempt"("status");

-- AddForeignKey
ALTER TABLE "FilingAttempt" ADD CONSTRAINT "FilingAttempt_taxReturnId_fkey" FOREIGN KEY ("taxReturnId") REFERENCES "TaxReturn"("id") ON DELETE CASCADE ON UPDATE CASCADE;
