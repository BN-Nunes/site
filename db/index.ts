import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

// No wrangler config declares a `DB` binding in this project, so it doesn't
// exist on the ambient `Env` type. This local shape documents what getDb()
// expects if a D1 binding is ever added.
type D1Env = { DB?: D1Database };

export function getDb() {
  const { DB } = env as D1Env;
  if (!DB) {
    throw new Error(
      "Cloudflare D1 binding `DB` is unavailable. Set the `d1` field in .openai/hosting.json to `DB` or let your control plane inject the real binding values before using the database."
    );
  }

  return drizzle(DB, { schema });
}
