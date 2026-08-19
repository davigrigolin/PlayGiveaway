-- AlterTable
ALTER TABLE "raffles" ADD COLUMN     "winner_ids" TEXT[] DEFAULT ARRAY[]::TEXT[];
