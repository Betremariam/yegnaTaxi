-- AlterTable
ALTER TABLE "User" ADD COLUMN     "fermataId" TEXT,
ADD COLUMN     "plateNumber" TEXT;

-- CreateTable
CREATE TABLE "Fermata" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fare" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Fermata_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Fermata_name_key" ON "Fermata"("name");

-- CreateIndex
CREATE INDEX "Fermata_name_idx" ON "Fermata"("name");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_fermataId_fkey" FOREIGN KEY ("fermataId") REFERENCES "Fermata"("id") ON DELETE SET NULL ON UPDATE CASCADE;
