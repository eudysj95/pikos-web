-- CreateEnum
CREATE TYPE "OrigenTasa" AS ENUM ('MANUAL', 'BCV_AUTO');

-- AlterTable
ALTER TABLE "tasas_cambio" ADD COLUMN "origen" "OrigenTasa" NOT NULL DEFAULT 'MANUAL';
