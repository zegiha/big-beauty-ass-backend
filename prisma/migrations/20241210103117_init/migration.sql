/*
  Warnings:

  - Added the required column `q1` to the `Pr` table without a default value. This is not possible if the table is not empty.
  - Added the required column `q2` to the `Pr` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Pr" ADD COLUMN     "q1" TEXT NOT NULL,
ADD COLUMN     "q2" TEXT NOT NULL;
