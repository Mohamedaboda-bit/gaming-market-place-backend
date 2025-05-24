/*
  Warnings:

  - The values [stripe] on the enum `PaymentProviderEnum` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PaymentProviderEnum_new" AS ENUM ('moyasar', 'paypal');
ALTER TABLE "user_payment_methods" ALTER COLUMN "provider" TYPE "PaymentProviderEnum_new" USING ("provider"::text::"PaymentProviderEnum_new");
ALTER TYPE "PaymentProviderEnum" RENAME TO "PaymentProviderEnum_old";
ALTER TYPE "PaymentProviderEnum_new" RENAME TO "PaymentProviderEnum";
DROP TYPE "PaymentProviderEnum_old";
COMMIT;
