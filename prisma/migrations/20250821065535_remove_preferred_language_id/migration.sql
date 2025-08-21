/*
  Warnings:

  - You are about to drop the column `preferred_language_id` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."users" DROP COLUMN "preferred_language_id";
