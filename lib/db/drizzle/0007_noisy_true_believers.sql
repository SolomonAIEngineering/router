CREATE TABLE IF NOT EXISTS "seasonalModel" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"version" text NOT NULL,
	"type" text NOT NULL,
	"purpose" text NOT NULL,
	"configuration" jsonb,
	"performance" jsonb,
	"lifecycle" jsonb,
	"monitoring" jsonb,
	"createdAt" timestamp with time zone NOT NULL,
	"updatedAt" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "seasonalPattern" ALTER COLUMN "pattern" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "seasonalAnalytics" ADD COLUMN "patternId" text NOT NULL;--> statement-breakpoint
ALTER TABLE "seasonalAnalytics" ADD COLUMN "period" jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "seasonalAnalytics" ADD COLUMN "metrics" jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "seasonalAnalytics" ADD COLUMN "insights" jsonb;--> statement-breakpoint
ALTER TABLE "seasonalAnalytics" ADD COLUMN "attribution" jsonb;--> statement-breakpoint
ALTER TABLE "seasonalAnalytics" ADD COLUMN "metadata" jsonb;--> statement-breakpoint
ALTER TABLE "seasonalAnalytics" ADD COLUMN "created_at" timestamp with time zone NOT NULL;--> statement-breakpoint
ALTER TABLE "seasonalAnalytics" ADD COLUMN "updated_at" timestamp with time zone NOT NULL;--> statement-breakpoint
ALTER TABLE "seasonalPattern" ADD COLUMN "industryId" text NOT NULL;--> statement-breakpoint
ALTER TABLE "seasonalPattern" ADD COLUMN "region" text NOT NULL;--> statement-breakpoint
ALTER TABLE "seasonalPattern" ADD COLUMN "realTimeModifiers" jsonb;--> statement-breakpoint
ALTER TABLE "seasonalPattern" ADD COLUMN "modelId" text;--> statement-breakpoint
ALTER TABLE "seasonalPattern" ADD COLUMN "confidenceScore" numeric(4, 3) NOT NULL;--> statement-breakpoint
ALTER TABLE "seasonalPattern" ADD COLUMN "lastUpdated" timestamp with time zone NOT NULL;--> statement-breakpoint
ALTER TABLE "seasonalPattern" ADD COLUMN "nextUpdate" timestamp with time zone NOT NULL;--> statement-breakpoint
ALTER TABLE "seasonalPattern" ADD COLUMN "metadata" jsonb;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "seasonalAnalytics" ADD CONSTRAINT "seasonalAnalytics_patternId_seasonalPattern_id_fk" FOREIGN KEY ("patternId") REFERENCES "public"."seasonalPattern"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "seasonalPattern" ADD CONSTRAINT "seasonalPattern_industryId_industryCategory_id_fk" FOREIGN KEY ("industryId") REFERENCES "public"."industryCategory"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "seasonalPattern" ADD CONSTRAINT "seasonalPattern_modelId_seasonalModel_id_fk" FOREIGN KEY ("modelId") REFERENCES "public"."seasonalModel"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "seasonalAnalytics" DROP COLUMN IF EXISTS "season";--> statement-breakpoint
ALTER TABLE "seasonalAnalytics" DROP COLUMN IF EXISTS "year";--> statement-breakpoint
ALTER TABLE "seasonalAnalytics" DROP COLUMN IF EXISTS "totalLeads";--> statement-breakpoint
ALTER TABLE "seasonalAnalytics" DROP COLUMN IF EXISTS "convertedLeads";--> statement-breakpoint
ALTER TABLE "seasonalAnalytics" DROP COLUMN IF EXISTS "totalRevenue";--> statement-breakpoint
ALTER TABLE "seasonalPattern" DROP COLUMN IF EXISTS "industry";--> statement-breakpoint
ALTER TABLE "seasonalPattern" DROP COLUMN IF EXISTS "yearAnalyzed";