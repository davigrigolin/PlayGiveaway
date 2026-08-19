-- Cada participação pública guarda os próprios dados de contato.
ALTER TABLE "participants"
ADD COLUMN "name" TEXT,
ADD COLUMN "email" TEXT;

-- Preserva os dados de participações existentes antes de remover o vínculo com usuários.
UPDATE "participants" AS participant
SET
  "name" = "users"."name",
  "email" = "users"."email"
FROM "users"
WHERE participant."user_id" = "users"."id";

ALTER TABLE "participants"
ALTER COLUMN "name" SET NOT NULL,
ALTER COLUMN "email" SET NOT NULL;

ALTER TABLE "participants"
DROP CONSTRAINT "participants_user_id_fkey";

DROP INDEX "participants_raffle_id_user_id_key";

ALTER TABLE "participants"
DROP COLUMN "user_id";

CREATE UNIQUE INDEX "participants_raffle_id_email_key"
ON "participants"("raffle_id", "email");
