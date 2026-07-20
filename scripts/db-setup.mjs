import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const schema = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "../db/schema.sql"),
  "utf8"
);

const sql = postgres(url, { prepare: false, max: 1 });
await sql.unsafe(schema);
await sql.end();
console.log("Schema applied.");
