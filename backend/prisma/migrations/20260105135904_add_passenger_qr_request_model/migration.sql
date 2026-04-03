-- CreateEnum
CREATE TYPE "QRRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "PassengerQRRequest" (
    "id" TEXT NOT NULL,
    "passengerId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "reason" TEXT,
    "status" "QRRequestStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "PassengerQRRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PassengerQRRequest_passengerId_idx" ON "PassengerQRRequest"("passengerId");

-- CreateIndex
CREATE INDEX "PassengerQRRequest_agentId_idx" ON "PassengerQRRequest"("agentId");

-- CreateIndex
CREATE INDEX "PassengerQRRequest_status_idx" ON "PassengerQRRequest"("status");

-- AddForeignKey
ALTER TABLE "PassengerQRRequest" ADD CONSTRAINT "PassengerQRRequest_passengerId_fkey" FOREIGN KEY ("passengerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PassengerQRRequest" ADD CONSTRAINT "PassengerQRRequest_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
