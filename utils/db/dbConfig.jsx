import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Make sure this code runs only on the server
const databaseUrl = "postgresql://Smart:npg_dohcID5B1pmM@ep-wispy-recipe-a8qh8se6-pooler.eastus2.azure.neon.tech/cleaning%20system?sslmode=require";

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not defined. Please set it in your .env.local file.");
}

const sql = neon(databaseUrl);

export const db = drizzle(sql, { schema });
