-- CreateTable
CREATE TABLE "public"."user_rewards_claims" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "rewards_claimed" DECIMAL(10,4) NOT NULL DEFAULT 0.0,
    "txn_hash" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_rewards_claims_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_rewards_claims_txn_hash_key" ON "public"."user_rewards_claims"("txn_hash");

-- CreateIndex
CREATE INDEX "user_rewards_claims_user_id_idx" ON "public"."user_rewards_claims"("user_id");

-- AddForeignKey
ALTER TABLE "public"."user_rewards_claims" ADD CONSTRAINT "user_rewards_claims_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
