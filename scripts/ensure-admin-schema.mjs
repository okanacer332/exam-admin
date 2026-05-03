import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: ["error"],
});

const maxAttempts = Number(process.env.ADMIN_DB_BOOT_ATTEMPTS || 20);
const delayMs = Number(process.env.ADMIN_DB_BOOT_DELAY_MS || 1500);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function splitSqlStatements(sql) {
  return sql
    .split(/;\s*(?:\r?\n|$)/)
    .map((statement) => statement.trim())
    .filter(Boolean);
}

async function ensureSchema() {
  const schemaPath = join(process.cwd(), "db", "admin-schema.sql");
  const sql = await readFile(schemaPath, "utf8");

  for (const statement of splitSqlStatements(sql)) {
    await prisma.$executeRawUnsafe(statement);
  }
}

for (let attempt = 1; attempt <= maxAttempts; attempt++) {
  try {
    await ensureSchema();
    await prisma.$disconnect();
    console.log("Admin schema is ready.");
    process.exit(0);
  } catch (error) {
    await prisma.$disconnect().catch(() => null);

    if (attempt === maxAttempts) {
      console.error("Admin schema could not be prepared.", error);
      process.exit(1);
    }

    console.log(`Waiting for database before admin schema setup (${attempt}/${maxAttempts})...`);
    await sleep(delayMs);
  }
}
