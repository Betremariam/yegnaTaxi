/*
  Warnings:

  - You are about to drop the column `fermataId` on the `User` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_fermataId_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "fermataId";

-- CreateTable
CREATE TABLE "_UserFermatas" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_UserFermatas_AB_unique" ON "_UserFermatas"("A", "B");

-- CreateIndex
CREATE INDEX "_UserFermatas_B_index" ON "_UserFermatas"("B");

-- AddForeignKey
ALTER TABLE "_UserFermatas" ADD CONSTRAINT "_UserFermatas_A_fkey" FOREIGN KEY ("A") REFERENCES "Fermata"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserFermatas" ADD CONSTRAINT "_UserFermatas_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
