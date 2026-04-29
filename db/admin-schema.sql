CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS "admin_credit_events" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "admin_email" TEXT NOT NULL DEFAULT 'local-admin',
  "action" TEXT NOT NULL,
  "amount" INTEGER NOT NULL,
  "previous_balance" INTEGER NOT NULL,
  "new_balance" INTEGER NOT NULL,
  "note" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "admin_credit_events_user_id_idx"
  ON "admin_credit_events"("user_id");

CREATE INDEX IF NOT EXISTS "admin_credit_events_created_at_idx"
  ON "admin_credit_events"("created_at");

CREATE TABLE IF NOT EXISTS "admin_audit_logs" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "admin" TEXT NOT NULL DEFAULT 'local-admin',
  "action" TEXT NOT NULL,
  "target" TEXT,
  "metadata" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "admin_audit_logs_created_at_idx"
  ON "admin_audit_logs"("created_at");
