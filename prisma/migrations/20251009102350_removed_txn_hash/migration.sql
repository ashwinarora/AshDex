/*
  Warnings:

  - You are about to drop the column `txn_hash` on the `user_rewards_claims` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."user_rewards_claims_txn_hash_key";

-- AlterTable
ALTER TABLE "public"."user_rewards_claims" DROP COLUMN "txn_hash";
