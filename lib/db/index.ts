import { createClient } from "@vercel/postgres";
import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { drizzle } from "drizzle-orm/vercel-postgres";
import { endpoints, leads, logs, users } from "./schema";

/**
 * Represents a user in the system.
 * Inferred from the users table schema.
 * @see {@link users} for the table schema
 */
export type User = InferSelectModel<typeof users>;

/**
 * Represents the structure for creating a new user.
 * Used when inserting new user records into the database.
 * @see {@link users} for the table schema
 */
export type NewUser = InferInsertModel<typeof users>;

/**
 * Represents an endpoint configuration in the system.
 * Inferred from the endpoints table schema.
 * @see {@link endpoints} for the table schema
 */
export type Endpoint = InferSelectModel<typeof endpoints>;

/**
 * Represents the structure for creating a new endpoint.
 * Used when inserting new endpoint records into the database.
 * @see {@link endpoints} for the table schema
 */
export type NewEndpoint = InferInsertModel<typeof endpoints>;

/**
 * Represents a log entry in the system.
 * Inferred from the logs table schema.
 * @see {@link logs} for the table schema
 */
export type Log = InferSelectModel<typeof logs>;

/**
 * Represents the structure for creating a new log entry.
 * Used when inserting new log records into the database.
 * @see {@link logs} for the table schema
 */
export type NewLog = InferInsertModel<typeof logs>;

/**
 * Represents a lead in the system.
 * Inferred from the leads table schema.
 * @see {@link leads} for the table schema
 */
export type Lead = InferSelectModel<typeof leads>;

/**
 * Represents the structure for creating a new lead.
 * Used when inserting new lead records into the database.
 * @see {@link leads} for the table schema
 */
export type NewLead = InferInsertModel<typeof leads>;

if (!process.env.POSTGRES_URL) {
  throw new Error("POSTGRES_URL environment variable is not set");
}

/**
 * PostgreSQL client instance configured with the connection string from environment variables.
 * @throws {Error} If POSTGRES_URL environment variable is not set
 */
export const client = createClient({
  connectionString: process.env.POSTGRES_URL,
});

/**
 * Drizzle ORM instance configured with the PostgreSQL client.
 * Use this to perform database operations with type safety.
 * @example
 * ```typescript
 * const users = await db.select().from(users);
 * ```
 */
export const db = drizzle(client);
