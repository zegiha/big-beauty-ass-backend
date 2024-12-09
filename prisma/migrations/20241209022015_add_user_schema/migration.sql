/*
  Warnings:

  - A unique constraint covering the columns `[id]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `github_access_token` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_email` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_password` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "github_access_token" TEXT NOT NULL,
ADD COLUMN     "user_email" TEXT NOT NULL,
ADD COLUMN     "user_password" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");
