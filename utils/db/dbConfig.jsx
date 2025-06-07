import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Make sure this code runs only on the server
const databaseUrl = "postgresql://Management:npg_ITSQZ2NLOB3w@ep-holy-base-a88q73dh-pooler.eastus2.azure.neon.tech/System?sslmode=require";

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not defined. Please set it in your .env.local file.");
}

const sql = neon(databaseUrl);

export const db = drizzle(sql, { schema });
