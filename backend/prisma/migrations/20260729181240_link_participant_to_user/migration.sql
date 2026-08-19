/*
  Warnings:

  - You are about to drop the column `email` on the `participants` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `participants` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[raffle_id,user_id]` on the table `participants` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `user_id` to the `participants` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "participants_raffle_id_email_key";

-- AlterTable
ALTER TABLE "participants" DROP COLUMN "email",
DROP COLUMN "name",
ADD COLUMN     "user_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "participants_raffle_id_user_id_key" ON "participants"("raffle_id", "user_id");

-- AddForeignKey
ALTER TABLE "participants" ADD CONSTRAINT "participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
