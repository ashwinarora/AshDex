-- AlterTable
ALTER TABLE "public"."users" ALTER COLUMN "rewards_generated" SET DATA TYPE DECIMAL(18,4),
ALTER COLUMN "volume_traded" SET DATA TYPE DECIMAL(18,4);
