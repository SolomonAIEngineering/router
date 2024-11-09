CREATE TABLE IF NOT EXISTS "leadCampaignProgress" (
	"id" text PRIMARY KEY NOT NULL,
	"leadId" text NOT NULL,
	"campaignId" text NOT NULL,
	"currentStage" integer DEFAULT 0 NOT NULL,
	"status" text NOT NULL,
	"startedAt" timestamp with time zone NOT NULL,
	"completedAt" timestamp with time zone,
	"metadata" jsonb,
	CONSTRAINT "leadCampaignProgress_leadId_campaignId_unique" UNIQUE("leadId","campaignId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "leadContactHistory" (
	"id" text PRIMARY KEY NOT NULL,
	"leadId" text NOT NULL,
	"type" text NOT NULL,
	"status" text NOT NULL,
	"outcome" text,
	"notes" text,
	"scheduledAt" timestamp with time zone,
	"completedAt" timestamp with time zone,
	"createdAt" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "leadNurtureCampaigns" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"triggerConditions" jsonb NOT NULL,
	"stages" jsonb NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "leadScoringRules" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"condition" jsonb NOT NULL,
	"scoreAdjustment" integer NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"priority" integer NOT NULL,
	"createdAt" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "enhancedLeadScore" ALTER COLUMN "baseScore" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "enhancedLeadScore" ALTER COLUMN "engagementScore" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "enhancedLeadScore" ALTER COLUMN "seasonalityScore" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "enhancedLeadScore" ALTER COLUMN "demographicScore" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "enhancedLeadScore" ALTER COLUMN "behavioralScore" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "enhancedLeadScore" ALTER COLUMN "totalScore" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "enhancedLeadScore" ADD COLUMN "urgencyScore" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "enhancedLeadScore" ADD COLUMN "budgetScore" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "enhancedLeadScore" ADD COLUMN "scoreHistory" jsonb;--> statement-breakpoint
ALTER TABLE "enhancedLeadScore" ADD COLUMN "lastCalculated" timestamp with time zone NOT NULL;--> statement-breakpoint
ALTER TABLE "enhancedLeadScore" ADD COLUMN "nextRecalculationDate" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "leadEngagement" ADD COLUMN "channel" text NOT NULL;--> statement-breakpoint
ALTER TABLE "leadEngagement" ADD COLUMN "userAgent" text;--> statement-breakpoint
ALTER TABLE "leadEngagement" ADD COLUMN "metadata" jsonb;--> statement-breakpoint
ALTER TABLE "leadEngagement" ADD COLUMN "sessionId" text;--> statement-breakpoint
ALTER TABLE "seasonalPattern" ADD COLUMN "seasonName" text NOT NULL;--> statement-breakpoint
ALTER TABLE "seasonalPattern" ADD COLUMN "startDate" date NOT NULL;--> statement-breakpoint
ALTER TABLE "seasonalPattern" ADD COLUMN "endDate" date NOT NULL;--> statement-breakpoint
ALTER TABLE "seasonalPattern" ADD COLUMN "expectedLeadIncrease" integer;--> statement-breakpoint
ALTER TABLE "seasonalPattern" ADD COLUMN "typicalConversionRate" integer;--> statement-breakpoint
ALTER TABLE "seasonalPattern" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "seasonalPattern" ADD COLUMN "createdAt" timestamp with time zone NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "leadCampaignProgress" ADD CONSTRAINT "leadCampaignProgress_leadId_lead_id_fk" FOREIGN KEY ("leadId") REFERENCES "public"."lead"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "leadCampaignProgress" ADD CONSTRAINT "leadCampaignProgress_campaignId_leadNurtureCampaigns_id_fk" FOREIGN KEY ("campaignId") REFERENCES "public"."leadNurtureCampaigns"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "leadContactHistory" ADD CONSTRAINT "leadContactHistory_leadId_lead_id_fk" FOREIGN KEY ("leadId") REFERENCES "public"."lead"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "enhancedLeadScore" DROP COLUMN IF EXISTS "lastUpdated";