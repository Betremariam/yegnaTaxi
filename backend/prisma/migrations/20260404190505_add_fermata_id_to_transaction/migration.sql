-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "fermataId" TEXT;

-- CreateIndex
CREATE INDEX "Transaction_fermataId_idx" ON "Transaction"("fermataId");

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_fermataId_fkey" FOREIGN KEY ("fermataId") REFERENCES "Fermata"("id") ON DELETE SET NULL ON UPDATE CASCADE;
