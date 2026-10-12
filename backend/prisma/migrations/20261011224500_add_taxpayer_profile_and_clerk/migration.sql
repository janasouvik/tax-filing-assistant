-- CreateEnum
CREATE TYPE "AadhaarPanLinkStatus" AS ENUM ('LINKED', 'NOT_LINKED', 'PENDING', 'FAILED', 'PAN_INOPERATIVE', 'EXEMPT', 'UNKNOWN', 'SERVICE_UNAVAILABLE');

-- CreateEnum
CREATE TYPE "PANVerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'FAILED', 'INACTIVE', 'NAME_MISMATCH', 'DOB_MISMATCH', 'SERVICE_UNAVAILABLE', 'SANDBOX', 'NOT_FOUND');

-- CreateEnum
CREATE TYPE "ResidentialStatus" AS ENUM ('RESIDENT', 'NON_RESIDENT', 'RESIDENT_BUT_NOT_ORDINARILY_RESIDENT');

-- DropForeignKey
ALTER TABLE "RefreshToken" DROP CONSTRAINT IF EXISTS "RefreshToken_userId_fkey";

-- AlterTable
ALTER TABLE "TaxReturn" ADD COLUMN IF NOT EXISTS "ackNumber" TEXT,
ADD COLUMN IF NOT EXISTS "filedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "transactionId" TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN IF EXISTS "isVerified",
DROP COLUMN IF EXISTS "name",
DROP COLUMN IF EXISTS "passwordHash",
ADD COLUMN IF NOT EXISTS "clerkId" TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS "firstName" TEXT,
ADD COLUMN IF NOT EXISTS "lastName" TEXT;

-- DropTable
DROP TABLE IF EXISTS "RefreshToken";

-- CreateTable
CREATE TABLE IF NOT EXISTS "TaxpayerProfile" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "assessmentYear" TEXT NOT NULL DEFAULT '2026-27',
    "fullName" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "mobileNumber" TEXT,
    "email" TEXT,
    "residentialStatus" "ResidentialStatus" NOT NULL DEFAULT 'RESIDENT',
    "state" TEXT,
    "city" TEXT,
    "pinCode" TEXT,
    "filingStatus" TEXT NOT NULL DEFAULT 'DRAFT',
    "onboardingStep" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TaxpayerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "AadhaarPanStatus" (
    "id" TEXT NOT NULL,
    "taxpayerProfileId" TEXT NOT NULL,
    "status" "AadhaarPanLinkStatus" NOT NULL DEFAULT 'UNKNOWN',
    "isSandbox" BOOLEAN NOT NULL DEFAULT true,
    "providerReference" TEXT,
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "checkedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AadhaarPanStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "PANVerification" (
    "id" TEXT NOT NULL,
    "taxpayerProfileId" TEXT NOT NULL,
    "pan" TEXT NOT NULL,
    "panMasked" TEXT NOT NULL,
    "submittedName" TEXT,
    "submittedDob" TEXT,
    "verifiedName" TEXT,
    "verifiedDob" TEXT,
    "panStatus" TEXT,
    "status" "PANVerificationStatus" NOT NULL DEFAULT 'PENDING',
    "nameMatch" BOOLEAN,
    "dobMatch" BOOLEAN,
    "isSandbox" BOOLEAN NOT NULL DEFAULT true,
    "providerReference" TEXT,
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "category" TEXT,
    "fullName" TEXT,
    "firstName" TEXT,
    "middleName" TEXT,
    "lastName" TEXT,
    "aadhaarSeedingStatus" TEXT,
    "verificationProvider" TEXT,
    "traceId" TEXT,
    "setuVerification" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PANVerification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "TaxpayerProfile_workspaceId_key" ON "TaxpayerProfile"("workspaceId" ASC);
CREATE INDEX IF NOT EXISTS "TaxpayerProfile_workspaceId_idx" ON "TaxpayerProfile"("workspaceId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "AadhaarPanStatus_taxpayerProfileId_key" ON "AadhaarPanStatus"("taxpayerProfileId" ASC);
CREATE INDEX IF NOT EXISTS "AadhaarPanStatus_taxpayerProfileId_idx" ON "AadhaarPanStatus"("taxpayerProfileId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "PANVerification_taxpayerProfileId_key" ON "PANVerification"("taxpayerProfileId" ASC);
CREATE INDEX IF NOT EXISTS "PANVerification_taxpayerProfileId_idx" ON "PANVerification"("taxpayerProfileId" ASC);
CREATE INDEX IF NOT EXISTS "PANVerification_pan_idx" ON "PANVerification"("pan" ASC);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "User_clerkId_key" ON "User"("clerkId" ASC);
CREATE INDEX IF NOT EXISTS "User_clerkId_idx" ON "User"("clerkId" ASC);

-- AddForeignKey
ALTER TABLE "TaxpayerProfile" DROP CONSTRAINT IF EXISTS "TaxpayerProfile_workspaceId_fkey";
ALTER TABLE "TaxpayerProfile" ADD CONSTRAINT "TaxpayerProfile_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AadhaarPanStatus" DROP CONSTRAINT IF EXISTS "AadhaarPanStatus_taxpayerProfileId_fkey";
ALTER TABLE "AadhaarPanStatus" ADD CONSTRAINT "AadhaarPanStatus_taxpayerProfileId_fkey" FOREIGN KEY ("taxpayerProfileId") REFERENCES "TaxpayerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PANVerification" DROP CONSTRAINT IF EXISTS "PANVerification_taxpayerProfileId_fkey";
ALTER TABLE "PANVerification" ADD CONSTRAINT "PANVerification_taxpayerProfileId_fkey" FOREIGN KEY ("taxpayerProfileId") REFERENCES "TaxpayerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
