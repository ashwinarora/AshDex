-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "wallet_id" VARCHAR(42) NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "avatar_url" INTEGER,
    "preferred_language_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_preferences" JSONB,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
