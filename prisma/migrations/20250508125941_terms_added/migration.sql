-- CreateTable
CREATE TABLE "Terms" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Terms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserTermsSignature" (
    "user_id" INTEGER NOT NULL,
    "terms_id" INTEGER NOT NULL,
    "signature" TEXT NOT NULL,
    "signed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserTermsSignature_pkey" PRIMARY KEY ("user_id","terms_id")
);

-- AddForeignKey
ALTER TABLE "UserTermsSignature" ADD CONSTRAINT "UserTermsSignature_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTermsSignature" ADD CONSTRAINT "UserTermsSignature_terms_id_fkey" FOREIGN KEY ("terms_id") REFERENCES "Terms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
