-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('ACTIVE', 'SUPERSEDED', 'INVALIDATED');

-- DropIndex
DROP INDEX IF EXISTS "Approval_taxReturnId_key";

-- AlterTable
ALTER TABLE "Approval" ADD COLUMN "status" "ApprovalStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN "invalidatedAt" TIMESTAMP(3),
ADD COLUMN "invalidationReason" TEXT;

-- CreateIndex
CREATE INDEX "Approval_taxReturnId_idx" ON "Approval"("taxReturnId");

-- CreateIndex
CREATE INDEX "Approval_taxReturnId_status_idx" ON "Approval"("taxReturnId", "status");

-- CreatePartialUniqueIndex
CREATE UNIQUE INDEX "Approval_taxReturnId_active_key" ON "Approval"("taxReturnId") WHERE "status" = 'ACTIVE';
