/*
  Warnings:

  - The values [COMMISSION,DEPOSIT] on the enum `TransactionType` will be removed. If these variants are still used in the database, this will fail.
  - The values [AGENT] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `commissionBalance` on the `Balance` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `otp` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `otpExpiry` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `plateNumber` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `qrCode` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `AgentCommission` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PassengerQRRequest` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PendingPayment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `QRCode` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[nationalId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TransactionType_new" AS ENUM ('TOP_UP', 'FARE_PAYMENT', 'REFUND');
ALTER TABLE "Transaction" ALTER COLUMN "type" TYPE "TransactionType_new" USING ("type"::text::"TransactionType_new");
ALTER TYPE "TransactionType" RENAME TO "TransactionType_old";
ALTER TYPE "TransactionType_new" RENAME TO "TransactionType";
DROP TYPE "TransactionType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "UserRole_new" AS ENUM ('PASSENGER', 'DRIVER', 'SUB_ADMIN', 'SUPER_ADMIN');
ALTER TABLE "User" ALTER COLUMN "role" TYPE "UserRole_new" USING ("role"::text::"UserRole_new");
ALTER TABLE "PaymentRecord" ALTER COLUMN "userRole" TYPE "UserRole_new" USING ("userRole"::text::"UserRole_new");
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "UserRole_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "AgentCommission" DROP CONSTRAINT "AgentCommission_agentId_fkey";

-- DropForeignKey
ALTER TABLE "PassengerQRRequest" DROP CONSTRAINT "PassengerQRRequest_agentId_fkey";

-- DropForeignKey
ALTER TABLE "PassengerQRRequest" DROP CONSTRAINT "PassengerQRRequest_passengerId_fkey";

-- DropForeignKey
ALTER TABLE "PendingPayment" DROP CONSTRAINT "PendingPayment_agentId_fkey";

-- DropForeignKey
ALTER TABLE "PendingPayment" DROP CONSTRAINT "PendingPayment_passengerId_fkey";

-- DropForeignKey
ALTER TABLE "QRCode" DROP CONSTRAINT "QRCode_userId_fkey";

-- DropIndex
DROP INDEX "User_email_idx";

-- DropIndex
DROP INDEX "User_email_key";

-- DropIndex
DROP INDEX "User_qrCode_key";

-- AlterTable
ALTER TABLE "Balance" DROP COLUMN "commissionBalance";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "email",
DROP COLUMN "otp",
DROP COLUMN "otpExpiry",
DROP COLUMN "plateNumber",
DROP COLUMN "qrCode",
ADD COLUMN     "carModel" TEXT,
ADD COLUMN     "licensePlate" TEXT,
ADD COLUMN     "nationalId" TEXT,
ALTER COLUMN "isVerified" SET DEFAULT true;

-- DropTable
DROP TABLE "AgentCommission";

-- DropTable
DROP TABLE "PassengerQRRequest";

-- DropTable
DROP TABLE "PendingPayment";

-- DropTable
DROP TABLE "QRCode";

-- DropEnum
DROP TYPE "QRRequestStatus";

-- CreateIndex
CREATE UNIQUE INDEX "User_nationalId_key" ON "User"("nationalId");

-- CreateIndex
CREATE INDEX "User_nationalId_idx" ON "User"("nationalId");
