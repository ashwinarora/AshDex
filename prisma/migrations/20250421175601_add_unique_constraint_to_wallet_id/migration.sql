/*
  Warnings:

  - A unique constraint covering the columns `[wallet_id]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "User_wallet_id_key" ON "User"("wallet_id");
