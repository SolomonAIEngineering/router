CREATE TABLE IF NOT EXISTS "abTestCampaign" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"startDate" timestamp with time zone NOT NULL,
	"endDate" timestamp with time zone,
	"status" text NOT NULL,
	"variants" jsonb,
	"metrics" jsonb
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "communicationTemplate" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"subject" text,
	"content" text NOT NULL,
	"variables" jsonb,
	"industry" text,
	"season" text,
	"tags" jsonb,
	"isActive" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "competitorAnalysis" (
	"id" text PRIMARY KEY NOT NULL,
	"competitorName" text NOT NULL,
	"activityType" text NOT NULL,
	"season" text,
	"impact" integer NOT NULL,
	"description" text,
	"observedAt" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "customField" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"label" text NOT NULL,
	"type" text NOT NULL,
	"options" jsonb,
	"validation" jsonb,
	"industry" text,
	"isActive" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "deal" (
	"id" text PRIMARY KEY NOT NULL,
	"leadId" text NOT NULL,
	"stage" text NOT NULL,
	"value" numeric(10, 2) NOT NULL,
	"probability" integer NOT NULL,
	"expectedCloseDate" timestamp with time zone,
	"actualCloseDate" timestamp with time zone,
	"reason" text,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "enhancedLeadScore" (
	"id" text PRIMARY KEY NOT NULL,
	"leadId" text NOT NULL,
	"baseScore" integer NOT NULL,
	"engagementScore" integer NOT NULL,
	"seasonalityScore" integer NOT NULL,
	"demographicScore" integer NOT NULL,
	"behavioralScore" integer NOT NULL,
	"totalScore" integer NOT NULL,
	"lastUpdated" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "enhancedLog" (
	"id" text PRIMARY KEY NOT NULL,
	"category" text NOT NULL,
	"severity" text NOT NULL,
	"context" jsonb NOT NULL,
	"timestamp" timestamp with time zone DEFAULT now() NOT NULL,
	"relatedEntityId" text,
	"relatedEntityType" text,
	"source" text NOT NULL,
	"stackTrace" text,
	"duration" integer,
	"ip" text,
	"userAgent" text,
	"tags" jsonb,
	"resolved" boolean DEFAULT false,
	"resolvedBy" text,
	"resolvedAt" timestamp with time zone,
	"notes" text,
	"retentionDays" integer DEFAULT 30
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "followUpTask" (
	"id" text PRIMARY KEY NOT NULL,
	"leadId" text NOT NULL,
	"assignedTo" text NOT NULL,
	"type" text NOT NULL,
	"priority" text NOT NULL,
	"dueDate" timestamp with time zone NOT NULL,
	"status" text NOT NULL,
	"notes" text,
	"completedAt" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "formBuilder" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"fields" jsonb NOT NULL,
	"styling" jsonb,
	"settings" jsonb
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "insight" (
	"id" text PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"content" jsonb NOT NULL,
	"createdAt" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "integrationConfig" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"provider" text NOT NULL,
	"config" jsonb,
	"status" text NOT NULL,
	"lastSynced" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "leadEngagement" (
	"id" text PRIMARY KEY NOT NULL,
	"leadId" text NOT NULL,
	"type" text NOT NULL,
	"metadata" jsonb,
	"timestamp" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "leadQualificationRule" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"conditions" jsonb NOT NULL,
	"minimumScore" integer NOT NULL,
	"industry" text NOT NULL,
	"isActive" boolean DEFAULT true,
	"createdAt" timestamp with time zone NOT NULL,
	"updatedAt" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "leadRoutingRule" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"priority" integer NOT NULL,
	"conditions" jsonb NOT NULL,
	"assignTo" jsonb NOT NULL,
	"isActive" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "nurtureSequence" (
	"id" text PRIMARY KEY NOT NULL,
	"industry" text NOT NULL,
	"season" text NOT NULL,
	"messageTemplate" jsonb NOT NULL,
	"sequenceOrder" integer NOT NULL,
	"delayInDays" integer NOT NULL,
	"variationId" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "performanceMetric" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"metric" text NOT NULL,
	"value" numeric(10, 2) NOT NULL,
	"dimension" jsonb,
	"timestamp" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pipelineStage" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"order" integer NOT NULL,
	"industry" text,
	"expectedDurationDays" integer,
	"requirements" jsonb
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "predictiveModel" (
	"id" text PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"parameters" jsonb NOT NULL,
	"accuracy" numeric(4, 3),
	"lastTrained" timestamp with time zone NOT NULL,
	"nextTrainingDue" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "seasonalAnalytics" (
	"id" text PRIMARY KEY NOT NULL,
	"season" text NOT NULL,
	"year" integer NOT NULL,
	"totalLeads" integer NOT NULL,
	"convertedLeads" integer NOT NULL,
	"totalRevenue" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "seasonalPattern" (
	"id" text PRIMARY KEY NOT NULL,
	"industry" text NOT NULL,
	"pattern" jsonb,
	"yearAnalyzed" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "teamMember" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"role" text NOT NULL,
	"permissions" jsonb NOT NULL,
	"assignedLeads" jsonb,
	"lastActive" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "userProfile" (
	"userId" text NOT NULL,
	"industry" text NOT NULL,
	"companySize" text NOT NULL,
	"timezone" text NOT NULL,
	"preferences" jsonb,
	"customFields" jsonb
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "workflow" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"trigger" jsonb,
	"actions" jsonb,
	"isActive" boolean DEFAULT true,
	"createdAt" timestamp with time zone NOT NULL,
	"updatedAt" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "lead" ADD COLUMN "channel" text NOT NULL;--> statement-breakpoint
ALTER TABLE "lead" ADD COLUMN "attributionData" jsonb;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "deal" ADD CONSTRAINT "deal_leadId_lead_id_fk" FOREIGN KEY ("leadId") REFERENCES "public"."lead"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "enhancedLeadScore" ADD CONSTRAINT "enhancedLeadScore_leadId_lead_id_fk" FOREIGN KEY ("leadId") REFERENCES "public"."lead"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "followUpTask" ADD CONSTRAINT "followUpTask_leadId_lead_id_fk" FOREIGN KEY ("leadId") REFERENCES "public"."lead"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "followUpTask" ADD CONSTRAINT "followUpTask_assignedTo_user_id_fk" FOREIGN KEY ("assignedTo") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "integrationConfig" ADD CONSTRAINT "integrationConfig_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "leadEngagement" ADD CONSTRAINT "leadEngagement_leadId_lead_id_fk" FOREIGN KEY ("leadId") REFERENCES "public"."lead"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "performanceMetric" ADD CONSTRAINT "performanceMetric_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "teamMember" ADD CONSTRAINT "teamMember_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "userProfile" ADD CONSTRAINT "userProfile_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
