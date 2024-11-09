import { loadEnvConfig } from "@next/env";
import { createClient } from "@vercel/postgres";
import { drizzle } from "drizzle-orm/vercel-postgres";
import { migrate } from "drizzle-orm/vercel-postgres/migrator";
import path from "path";

/**
 * Executes database migrations for the application.
 */
async function main() {
  let client;

  try {
    // Load env variables first
    const dev = process.env.NODE_ENV !== "production";
    const projectDir = path.resolve(__dirname, "../..");
    console.log("Project directory:", projectDir);

    const envResult = loadEnvConfig(projectDir, dev);
    console.log("Environment loaded:", envResult.loadedEnvFiles.length > 0);

    if (!process.env.POSTGRES_URL) {
      throw new Error("POSTGRES_URL environment variable is not set");
    }

    client = createClient({
      connectionString: process.env.POSTGRES_URL,
    });

    const db = drizzle(client);

    // Connect to the database before running migrations
    console.log("Connecting to database...");
    await client.connect();

    console.log("Running migrations...");
    await migrate(db, { migrationsFolder: "lib/db/drizzle" });
    console.log("Migrations complete");
  } catch (error) {
    console.log("Migrations failed");
    console.error(error);
    process.exit(1);
  } finally {
    // Always disconnect the client if it exists
    if (client) {
      await client.end();
      console.log("Database connection closed");
    }
  }
}

main();
