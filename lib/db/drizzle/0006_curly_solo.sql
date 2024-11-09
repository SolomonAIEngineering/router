DO $$ BEGIN
 CREATE TYPE "public"."actionPriority" AS ENUM('critical', 'high', 'medium', 'low', 'optional');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."analysisStatus" AS ENUM('pending', 'processing', 'completed', 'failed', 'scheduled');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."confidenceLevel" AS ENUM('very_high', 'high', 'moderate', 'low', 'uncertain');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."seasonType" AS ENUM('peak', 'off', 'transition', 'micro-peak', 'custom');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "industryCategory" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"parentId" text,
	"level" integer NOT NULL,
	"characteristics" jsonb,
	"metadata" jsonb,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "marketContext" (
	"id" text PRIMARY KEY NOT NULL,
	"industryId" text NOT NULL,
	"region" text NOT NULL,
	"timeframe" jsonb NOT NULL,
	"economicIndicators" jsonb,
	"marketConditions" jsonb,
	"regulatoryEnvironment" jsonb,
	"sentiment" jsonb,
	"timestamp" timestamp with time zone NOT NULL,
	"confidence" numeric(4, 3) NOT NULL,
	"lastUpdated" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "industryCategory" ADD CONSTRAINT "industryCategory_parentId_industryCategory_id_fk" FOREIGN KEY ("parentId") REFERENCES "public"."industryCategory"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "marketContext" ADD CONSTRAINT "marketContext_industryId_industryCategory_id_fk" FOREIGN KEY ("industryId") REFERENCES "public"."industryCategory"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
