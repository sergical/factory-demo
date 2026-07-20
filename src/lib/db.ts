import postgres from "postgres";

declare global {
  var __sql: ReturnType<typeof postgres> | undefined;
}

export const sql =
  globalThis.__sql ??
  postgres(process.env.DATABASE_URL ?? "", {
    prepare: false,
    max: 5,
    idle_timeout: 20,
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__sql = sql;
}
