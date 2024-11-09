CREATE TABLE IF NOT EXISTS "apiKey" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"name" text NOT NULL,
	"key" text NOT NULL,
	"secret" text NOT NULL,
	"permissions" jsonb NOT NULL,
	"lastUsed" timestamp with time zone,
	"expiresAt" timestamp with time zone,
	"rateLimit" jsonb
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "apiMetric" (
	"id" text PRIMARY KEY NOT NULL,
	"endpointId" text NOT NULL,
	"apiKeyId" text,
	"timestamp" timestamp with time zone NOT NULL,
	"method" text NOT NULL,
	"path" text NOT NULL,
	"statusCode" integer NOT NULL,
	"responseTime" integer NOT NULL,
	"requestSize" integer,
	"responseSize" integer,
	"error" jsonb
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "apiVersion" (
	"id" text PRIMARY KEY NOT NULL,
	"version" text NOT NULL,
	"status" text NOT NULL,
	"deprecationDate" timestamp with time zone,
	"sunsetDate" timestamp with time zone,
	"changelog" jsonb,
	"createdAt" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "webhookDelivery" (
	"id" text PRIMARY KEY NOT NULL,
	"endpointId" text NOT NULL,
	"leadId" text NOT NULL,
	"status" text NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"lastAttempt" timestamp with time zone,
	"nextAttempt" timestamp with time zone,
	"payload" jsonb NOT NULL,
	"response" jsonb,
	"error" text
);
--> statement-breakpoint
ALTER TABLE "leadEngagement" RENAME COLUMN "metadata" TO "url";--> statement-breakpoint
ALTER TABLE "endpoint" ALTER COLUMN "createdAt" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "endpoint" ALTER COLUMN "updatedAt" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "leadEngagement" ALTER COLUMN "url" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "lead" ALTER COLUMN "createdAt" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "lead" ALTER COLUMN "updatedAt" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "endpoint" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "endpoint" ADD COLUMN "apiVersionId" text;--> statement-breakpoint
ALTER TABLE "endpoint" ADD COLUMN "config" jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "endpoint" ADD COLUMN "monitoring" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "endpoint" ADD COLUMN "baseUrl" text;--> statement-breakpoint
ALTER TABLE "endpoint" ADD COLUMN "apiKey" text;--> statement-breakpoint
ALTER TABLE "endpoint" ADD COLUMN "secretKey" text;--> statement-breakpoint
ALTER TABLE "endpoint" ADD COLUMN "documentation" jsonb;--> statement-breakpoint
ALTER TABLE "leadEngagement" ADD COLUMN "duration" integer;--> statement-breakpoint
ALTER TABLE "leadEngagement" ADD COLUMN "device" text;--> statement-breakpoint
ALTER TABLE "leadEngagement" ADD COLUMN "location" text;--> statement-breakpoint
ALTER TABLE "lead" ADD COLUMN "validatedData" jsonb;--> statement-breakpoint
ALTER TABLE "lead" ADD COLUMN "enrichedData" jsonb;--> statement-breakpoint
ALTER TABLE "lead" ADD COLUMN "status" text DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "lead" ADD COLUMN "processingErrors" jsonb;--> statement-breakpoint
ALTER TABLE "lead" ADD COLUMN "apiVersion" text;--> statement-breakpoint
ALTER TABLE "lead" ADD COLUMN "requestId" text;--> statement-breakpoint
ALTER TABLE "lead" ADD COLUMN "ipAddress" text;--> statement-breakpoint
ALTER TABLE "lead" ADD COLUMN "userAgent" text;--> statement-breakpoint
ALTER TABLE "lead" ADD COLUMN "processedAt" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "lead" ADD COLUMN "enrichedAt" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "userProfile" ADD COLUMN "notifications" jsonb;--> statement-breakpoint
ALTER TABLE "userProfile" ADD COLUMN "lead_scoring_weights" jsonb;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "apiKey" ADD CONSTRAINT "apiKey_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "apiMetric" ADD CONSTRAINT "apiMetric_endpointId_endpoint_id_fk" FOREIGN KEY ("endpointId") REFERENCES "public"."endpoint"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "apiMetric" ADD CONSTRAINT "apiMetric_apiKeyId_apiKey_id_fk" FOREIGN KEY ("apiKeyId") REFERENCES "public"."apiKey"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "webhookDelivery" ADD CONSTRAINT "webhookDelivery_endpointId_endpoint_id_fk" FOREIGN KEY ("endpointId") REFERENCES "public"."endpoint"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "webhookDelivery" ADD CONSTRAINT "webhookDelivery_leadId_lead_id_fk" FOREIGN KEY ("leadId") REFERENCES "public"."lead"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "endpoint" ADD CONSTRAINT "endpoint_apiVersionId_apiVersion_id_fk" FOREIGN KEY ("apiVersionId") REFERENCES "public"."apiVersion"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
