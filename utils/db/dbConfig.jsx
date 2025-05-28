import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Make sure this code runs only on the server
const databaseUrl = "postgresql://cleaning:npg_ih6ud1GyPLZY@ep-orange-cake-a891rn2i-pooler.eastus2.azure.neon.tech/smart%20cleaning%20management%20system%20?sslmode=require";

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not defined. Please set it in your .env.local file.");
}

const sql = neon(databaseUrl);

export const db = drizzle(sql, { schema });
