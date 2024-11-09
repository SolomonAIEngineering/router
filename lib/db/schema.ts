import type { AdapterAccount } from "@auth/core/adapters";
import { init } from "@paralleldrive/cuid2";
import {
  boolean,
  date,
  decimal,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/pg-core";

const createId = init({ length: 8 });

/**
 * Core Enums & Types
 * ================
 */

export const seasonTypeEnum = pgEnum("seasonType", [
  "peak",
  "off",
  "transition",
  "micro-peak",
  "custom",
]);

export const analysisStatusEnum = pgEnum("analysisStatus", [
  "pending",
  "processing",
  "completed",
  "failed",
  "scheduled",
]);

export const confidenceLevelEnum = pgEnum("confidenceLevel", [
  "very_high",
  "high",
  "moderate",
  "low",
  "uncertain",
]);

export const actionPriorityEnum = pgEnum("actionPriority", [
  "critical",
  "high",
  "medium",
  "low",
  "optional",
]);

/**
 * Core User Management
 * ==================
 * These tables handle user authentication and core user data
 */

export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .notNull()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").notNull(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  leadCount: integer("leadCount").notNull().default(0),
  createdAt: timestamp("createdAt", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const userProfiles = pgTable("userProfile", {
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  industry: text("industry").notNull(),
  companySize: text("companySize").notNull(),
  timezone: text("timezone").notNull(),
  notifications: jsonb("notifications").$type<{
    email: boolean;
    push: boolean;
    slack: boolean;
  }>(),
  leadScoringWeights: jsonb("lead_scoring_weights").$type<{
    engagement: number;
    budget: number;
    timeframe: number;
  }>(),
  preferences: jsonb("preferences").$type<{
    notificationPreferences: {
      email: boolean;
      push: boolean;
      slack: boolean;
    };
    leadScoring: {
      weights: {
        engagement: number;
        budget: number;
        timeframe: number;
      };
    };
  }>(),
  customFields: jsonb("customFields").$type<Record<string, any>>(),
});

/**
 * Authentication Tables
 * ===================
 * Supporting tables for multi-provider authentication
 */

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccount["type"]>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  }),
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").notNull().primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  }),
);

/**
 * Lead Management Core
 * ===================
 * Core tables for managing leads and endpoints
 */

export const apiVersions = pgTable("apiVersion", {
  id: text("id")
    .$defaultFn(() => createId())
    .notNull()
    .primaryKey(),
  version: text("version").notNull(), // e.g., "v1", "v2"
  status: text("status").notNull(), // active, deprecated, sunset
  deprecationDate: timestamp("deprecationDate", { withTimezone: true }),
  sunsetDate: timestamp("sunsetDate", { withTimezone: true }),
  changelog: jsonb("changelog").$type<{
    changes: Array<{
      type: "breaking" | "feature" | "fix";
      description: string;
      migrationGuide?: string;
    }>;
  }>(),
  createdAt: timestamp("createdAt", { withTimezone: true }).notNull(),
});

// Enhanced Endpoints with API Management
export const endpoints = pgTable("endpoint", {
  id: text("id")
    .$defaultFn(() => createId())
    .notNull()
    .primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  apiVersionId: text("apiVersionId").references(() => apiVersions.id),

  // Enhanced Schema Management
  schema: jsonb("schema")
    .$type<{
      version: string;
      fields: Array<{
        key: string;
        type: ValidationType;
        required: boolean;
        validation?: {
          rules: Array<{
            type: string;
            params: Record<string, any>;
          }>;
        };
        description?: string;
        example?: any;
      }>;
      relationships?: Array<{
        field: string;
        type: "hasOne" | "hasMany";
        target: string;
      }>;
    }>()
    .notNull(),

  // Enhanced Configuration
  config: jsonb("config")
    .$type<{
      rateLimit: {
        requests: number;
        period: number; // in seconds
      };
      cors: {
        enabled: boolean;
        origins: string[];
        methods: string[];
      };
      auth: {
        type: "none" | "apiKey" | "oauth2" | "jwt";
        settings: Record<string, any>;
      };
      caching: {
        enabled: boolean;
        ttl: number;
      };
    }>()
    .notNull(),

  // Feature Flags
  enabled: boolean("enabled").default(true).notNull(),
  webhookEnabled: boolean("webhookEnabled").default(false).notNull(),
  emailNotify: boolean("emailNotify").default(false).notNull(),
  formEnabled: boolean("formEnabled").default(false).notNull(),
  monitoring: boolean("monitoring").default(true).notNull(),

  // URLs and Routing
  baseUrl: text("baseUrl"),
  webhook: text("webhook"),
  successUrl: text("successUrl"),
  failUrl: text("failUrl"),

  // Security
  token: text("token"),
  apiKey: text("apiKey"),
  secretKey: text("secretKey"),

  // Documentation
  documentation: jsonb("documentation").$type<{
    description: string;
    examples: Array<{
      title: string;
      code: string;
      language: string;
    }>;
    notes: string;
  }>(),

  // Timestamps
  createdAt: timestamp("createdAt", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).notNull(),
});

// Enhanced Leads with Advanced Features
export const leads = pgTable("lead", {
  id: text("id")
    .$defaultFn(() => createId())
    .notNull()
    .primaryKey(),
  endpointId: text("endpointId")
    .notNull()
    .references(() => endpoints.id, { onDelete: "cascade" }),

  // Enhanced Data Storage
  data: jsonb("data").$type<{ [key: string]: any }>().notNull(),
  validatedData: jsonb("validatedData").$type<{ [key: string]: any }>(),
  enrichedData: jsonb("enrichedData").$type<{ [key: string]: any }>(),

  // Enhanced Attribution
  channel: text("channel").notNull(),
  attributionData: jsonb("attributionData").$type<{
    source: string;
    medium: string;
    campaign: string;
    term: string;
    content: string;
    referrer: string;
    landingPage: string;
    deviceInfo: {
      type: string;
      os: string;
      browser: string;
    };
    geoLocation: {
      country: string;
      region: string;
      city: string;
    };
  }>(),

  // Processing Status
  status: text("status").notNull().default("pending"), // pending, processing, completed, failed
  processingErrors:
    jsonb("processingErrors").$type<
      Array<{
        code: string;
        message: string;
        timestamp: string;
      }>
    >(),

  // API Metadata
  apiVersion: text("apiVersion"),
  requestId: text("requestId"),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),

  // Timestamps with Processing Info
  createdAt: timestamp("createdAt", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).notNull(),
  processedAt: timestamp("processedAt", { withTimezone: true }),
  enrichedAt: timestamp("enrichedAt", { withTimezone: true }),
});

// API Keys Management
export const apiKeys = pgTable("apiKey", {
  id: text("id")
    .$defaultFn(() => createId())
    .notNull()
    .primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  key: text("key").notNull(),
  secret: text("secret").notNull(),
  permissions: jsonb("permissions").$type<string[]>().notNull(),
  lastUsed: timestamp("lastUsed", { withTimezone: true }),
  expiresAt: timestamp("expiresAt", { withTimezone: true }),
  rateLimit: jsonb("rateLimit").$type<{
    requests: number;
    period: number;
  }>(),
});

// API Usage Metrics
export const apiMetrics = pgTable("apiMetric", {
  id: text("id")
    .$defaultFn(() => createId())
    .notNull()
    .primaryKey(),
  endpointId: text("endpointId")
    .notNull()
    .references(() => endpoints.id, { onDelete: "cascade" }),
  apiKeyId: text("apiKeyId").references(() => apiKeys.id, {
    onDelete: "cascade",
  }),
  timestamp: timestamp("timestamp", { withTimezone: true }).notNull(),
  method: text("method").notNull(),
  path: text("path").notNull(),
  statusCode: integer("statusCode").notNull(),
  responseTime: integer("responseTime").notNull(),
  requestSize: integer("requestSize"),
  responseSize: integer("responseSize"),
  error: jsonb("error").$type<{
    code: string;
    message: string;
    stack?: string;
  }>(),
});

// Webhook Deliveries
export const webhookDeliveries = pgTable("webhookDelivery", {
  id: text("id")
    .$defaultFn(() => createId())
    .notNull()
    .primaryKey(),
  endpointId: text("endpointId")
    .notNull()
    .references(() => endpoints.id, { onDelete: "cascade" }),
  leadId: text("leadId")
    .notNull()
    .references(() => leads.id, { onDelete: "cascade" }),
  status: text("status").notNull(), // success, failed, pending
  attempts: integer("attempts").notNull().default(0),
  lastAttempt: timestamp("lastAttempt", { withTimezone: true }),
  nextAttempt: timestamp("nextAttempt", { withTimezone: true }),
  payload: jsonb("payload").notNull(),
  response: jsonb("response"),
  error: text("error"),
});

/**
 * Lead Engagement & Scoring
 * =======================
 * Tables for tracking lead engagement and calculating scores
 */

/**
 * Lead Contact History
 * Tracks all interactions and attempted contacts with leads
 */
export const leadContactHistory = pgTable("leadContactHistory", {
  id: text("id")
    .$defaultFn(() => createId())
    .notNull()
    .primaryKey(),
  leadId: text("leadId")
    .notNull()
    .references(() => leads.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // call, email, sms, meeting
  status: text("status").notNull(), // attempted, completed, scheduled
  outcome: text("outcome"), // interested, not_interested, callback_requested
  notes: text("notes"),
  scheduledAt: timestamp("scheduledAt", { withTimezone: true }),
  completedAt: timestamp("completedAt", { withTimezone: true }),
  createdAt: timestamp("createdAt", { withTimezone: true })
    .notNull()
    .$defaultFn(() => new Date()),
});

/**
 * Lead Scoring Rules
 * Configurable rules for calculating different score components
 */
export const leadScoringRules = pgTable("leadScoringRules", {
  id: text("id")
    .$defaultFn(() => createId())
    .notNull()
    .primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(), // engagement, seasonal, demographic, behavioral
  condition: jsonb("condition").notNull(), // Rule conditions in JSON format
  scoreAdjustment: integer("scoreAdjustment").notNull(),
  active: boolean("active").notNull().default(true),
  priority: integer("priority").notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true })
    .notNull()
    .$defaultFn(() => new Date()),
});

/**
 * Enhanced Lead Scores
 * Comprehensive scoring system with multiple components
 */
export const enhancedLeadScores = pgTable("enhancedLeadScore", {
  id: text("id")
    .$defaultFn(() => createId())
    .notNull()
    .primaryKey(),
  leadId: text("leadId")
    .notNull()
    .references(() => leads.id, { onDelete: "cascade" }),
  baseScore: integer("baseScore").notNull().default(0),
  engagementScore: integer("engagementScore").notNull().default(0),
  seasonalityScore: integer("seasonalityScore").notNull().default(0),
  demographicScore: integer("demographicScore").notNull().default(0),
  behavioralScore: integer("behavioralScore").notNull().default(0),
  urgencyScore: integer("urgencyScore").notNull().default(0),
  budgetScore: integer("budgetScore").notNull().default(0),
  totalScore: integer("totalScore").notNull().default(0),
  scoreHistory: jsonb("scoreHistory"), // Track score changes over time
  lastCalculated: timestamp("lastCalculated", { withTimezone: true }).notNull(),
  nextRecalculationDate: timestamp("nextRecalculationDate", {
    withTimezone: true,
  }),
});

/**
 * Lead Nurture Campaigns
 * Track automated nurture campaigns and lead progression
 */
export const leadNurtureCampaigns = pgTable("leadNurtureCampaigns", {
  id: text("id")
    .$defaultFn(() => createId())
    .notNull()
    .primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  triggerConditions: jsonb("triggerConditions").notNull(),
  stages: jsonb("stages").notNull(), // Array of campaign stages
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("createdAt", { withTimezone: true })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const leadCampaignProgress = pgTable(
  "leadCampaignProgress",
  {
    id: text("id")
      .$defaultFn(() => createId())
      .notNull()
      .primaryKey(),
    leadId: text("leadId")
      .notNull()
      .references(() => leads.id, { onDelete: "cascade" }),
    campaignId: text("campaignId")
      .notNull()
      .references(() => leadNurtureCampaigns.id),
    currentStage: integer("currentStage").notNull().default(0),
    status: text("status").notNull(), // active, completed, paused
    startedAt: timestamp("startedAt", { withTimezone: true }).notNull(),
    completedAt: timestamp("completedAt", { withTimezone: true }),
    metadata: jsonb("metadata"), // Store stage-specific progress data
  },
  (table) => ({
    // Ensure a lead is only in a campaign once
    uniqueLead: unique().on(table.leadId, table.campaignId),
  }),
);

/**
 * Enhanced Lead Engagements
 * Detailed tracking of how leads interact with your content and communications
 */
export const leadEngagements = pgTable("leadEngagement", {
  id: text("id")
    .$defaultFn(() => createId())
    .notNull()
    .primaryKey(),
  leadId: text("leadId")
    .notNull()
    .references(() => leads.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // email_open, click, form_submission, website_visit, chat
  channel: text("channel").notNull(), // email, website, social, phone
  url: text("url"),
  duration: integer("duration"),
  device: text("device"),
  location: text("location"),
  userAgent: text("userAgent"),
  metadata: jsonb("metadata"), // Additional engagement-specific data
  sessionId: text("sessionId"), // Group related engagements
  timestamp: timestamp("timestamp", { withTimezone: true }).notNull(),
});

/**
 * Seasonal Intelligence
 * ===================
 * Tables for managing seasonal patterns and analytics
 */
export const industryCategories = pgTable("industryCategory", {
  id: text("id")
    .$defaultFn(() => createId())
    .notNull()
    .primaryKey(),
  name: text("name").notNull(),
  parentId: text("parentId").references(() => industryCategories.id),
  level: integer("level").notNull(), // 1: sector, 2: industry, 3: sub-industry
  characteristics: jsonb("characteristics").$type<{
    seasonalFactors: Array<{
      name: string;
      importance: number;
      description: string;
    }>;
    keyEvents: Array<{
      name: string;
      timing: string;
      impact: "high" | "medium" | "low";
      duration: string;
    }>;
    externalFactors: Array<{
      factor: string;
      correlation: number;
      confidence: number;
      leadLag: string;
    }>;
    businessCycle: {
      averageDuration: string;
      peakPeriods: string[];
      volatilityIndex: number;
    };
  }>(),
  metadata: jsonb("metadata").$type<{
    marketSize: number;
    growthRate: number;
    seasonalityIndex: number;
    volatilityScore: number;
    competitiveIntensity: number;
  }>(),
  createdAt: timestamp("createdAt", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updatedAt", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Market Context and Conditions
export const marketContexts = pgTable("marketContext", {
  id: text("id")
    .$defaultFn(() => createId())
    .notNull()
    .primaryKey(),
  industryId: text("industryId")
    .notNull()
    .references(() => industryCategories.id),
  region: text("region").notNull(),
  timeframe: jsonb("timeframe")
    .$type<{
      start: string;
      end: string;
      resolution: "daily" | "weekly" | "monthly";
    }>()
    .notNull(),

  // Economic Indicators
  economicIndicators: jsonb("economicIndicators").$type<{
    gdp: {
      value: number;
      trend: number;
      forecast: number;
    };
    inflation: {
      value: number;
      trend: number;
      impact: number;
    };
    employmentRate: {
      value: number;
      trend: number;
      sectorSpecific: number;
    };
    consumerConfidence: {
      value: number;
      trend: number;
      segmentBreakdown: Record<string, number>;
    };
    industryGrowth: {
      value: number;
      trend: number;
      benchmarks: Record<string, number>;
    };
    marketSize: {
      value: number;
      growth: number;
      forecast: number;
    };
    competitiveDensity: {
      value: number;
      trend: number;
      analysis: string;
    };
  }>(),

  // Market Conditions
  marketConditions: jsonb("marketConditions").$type<{
    saturation: {
      overall: number;
      bySegment: Record<string, number>;
      trend: string;
    };
    growth: {
      rate: number;
      sustainability: number;
      barriers: string[];
    };
    competition: {
      intensity: number;
      keyPlayers: Array<{
        name: string;
        marketShare: number;
        trend: string;
      }>;
      threats: string[];
    };
    opportunities: Array<{
      description: string;
      potentialImpact: number;
      timeframe: string;
      requirements: string[];
    }>;
    threats: Array<{
      description: string;
      severity: number;
      probability: number;
      mitigations: string[];
    }>;
    trends: Array<{
      name: string;
      strength: number;
      direction: string;
      durability: string;
    }>;
  }>(),

  // Regulatory Environment
  regulatoryEnvironment: jsonb("regulatoryEnvironment").$type<{
    compliance: Array<{
      requirement: string;
      impact: string;
      deadline: string;
    }>;
    changes: Array<{
      description: string;
      effectiveDate: string;
      impact: string;
    }>;
    risks: Array<{
      description: string;
      likelihood: number;
      impact: string;
    }>;
  }>(),

  // Market Sentiment
  sentiment: jsonb("sentiment").$type<{
    overall: number;
    bySegment: Record<string, number>;
    drivers: Array<{
      factor: string;
      impact: number;
      trend: string;
    }>;
    analysis: string;
  }>(),

  timestamp: timestamp("timestamp", { withTimezone: true }).notNull(),
  confidence: decimal("confidence", { precision: 4, scale: 3 }).notNull(),
  lastUpdated: timestamp("lastUpdated", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/**
 * AI/ML Infrastructure
 * ==================
 */

// Model Registry and Management
export const seasonalModels = pgTable("seasonalModel", {
  id: text("id")
    .$defaultFn(() => createId())
    .notNull()
    .primaryKey(),
  name: text("name").notNull(),
  version: text("version").notNull(),
  type: text("type").notNull(), // time-series, neural-network, ensemble
  purpose: text("purpose").notNull(), // prediction, optimization, anomaly-detection

  // Model Architecture
  configuration: jsonb("configuration").$type<{
    architecture: {
      type: string;
      framework: string;
      layers: Array<{
        name: string;
        type: string;
        units: number;
        activation: string;
        dropout?: number;
        regularization?: {
          type: string;
          value: number;
        };
      }>;
      inputFeatures: Array<{
        name: string;
        type: string;
        preprocessing: string[];
      }>;
      outputFeatures: Array<{
        name: string;
        type: string;
        postprocessing: string[];
      }>;
    };

    // Training Configuration
    hyperparameters: {
      learningRate: number;
      batchSize: number;
      epochs: number;
      optimizer: {
        name: string;
        config: Record<string, any>;
      };
      lossFunction: string;
      metrics: string[];
      callbacks: Array<{
        name: string;
        config: Record<string, any>;
      }>;
    };

    // Feature Engineering
    features: Array<{
      name: string;
      importance: number;
      transformation: string;
      encoding: string;
      validation: {
        rules: string[];
        constraints: Record<string, any>;
      };
    }>;
  }>(),

  // Model Performance
  performance: jsonb("performance").$type<{
    overall: {
      accuracy: number;
      precision: number;
      recall: number;
      f1Score: number;
      auc: number;
      rmse: number;
    };
    bySegment: Record<
      string,
      {
        accuracy: number;
        precision: number;
        recall: number;
      }
    >;
    crossValidation: Array<{
      fold: number;
      metrics: Record<string, number>;
    }>;
    confusionMatrix: Array<Array<number>>;
    residualAnalysis: {
      mean: number;
      std: number;
      distribution: string;
    };
  }>(),

  // Model Lifecycle
  lifecycle: jsonb("lifecycle").$type<{
    status: string;
    createdAt: string;
    lastTrained: string;
    nextTraining: string;
    version: string;
    changes: Array<{
      version: string;
      date: string;
      changes: string[];
    }>;
  }>(),

  // Monitoring
  monitoring: jsonb("monitoring").$type<{
    driftDetection: {
      method: string;
      threshold: number;
      currentValue: number;
    };
    alerts: Array<{
      type: string;
      threshold: number;
      action: string;
    }>;
    maintenance: {
      schedule: string;
      lastCheck: string;
      status: string;
    };
  }>(),

  createdAt: timestamp("createdAt", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).notNull(),
});

export const seasonalPatterns = pgTable("seasonalPattern", {
  id: text("id")
    .$defaultFn(() => createId())
    .notNull()
    .primaryKey(),
  industryId: text("industryId")
    .notNull()
    .references(() => industryCategories.id),
  region: text("region").notNull(),
  seasonName: text("seasonName").notNull(), // spring_rush, holiday_season
  startDate: date("startDate").notNull(),
  endDate: date("endDate").notNull(),
  expectedLeadIncrease: integer("expectedLeadIncrease"), // percentage
  typicalConversionRate: integer("typicalConversionRate"),
  notes: text("notes"),
  // Core Pattern Definition
  pattern: jsonb("pattern")
    .$type<{
      cycles: Array<{
        name: string;
        startDate: string;
        endDate: string;
        type: seasonTypeEnum;
        intensity: number;
        reliability: number;
        triggers: Array<{
          event: string;
          leadTime: number;
          impact: number;
          confidence: number;
        }>;
        characteristics: {
          duration: string;
          volatility: number;
          repeatability: number;
          dependencies: string[];
        };
      }>;

      // Time Series Components
      dynamics: {
        trendComponent: Array<{
          timestamp: string;
          value: number;
          confidence: number;
        }>;
        seasonalComponent: Array<{
          timestamp: string;
          value: number;
          strength: number;
        }>;
        cyclicalComponent: Array<{
          timestamp: string;
          value: number;
          period: number;
        }>;
        noiseComponent: Array<{
          timestamp: string;
          value: number;
          significance: number;
        }>;
      };

      // Statistical Analysis
      correlations: Array<{
        factor: string;
        pearsonCoefficient: number;
        spearmanCoefficient: number;
        leadLag: number;
        causalityScore: number;
        confidence: number;
        significance: number;
      }>;

      // Anomaly Detection
      anomalies: Array<{
        date: string;
        metric: string;
        expected: number;
        actual: number;
        deviation: number;
        significance: number;
        explanation: string[];
        impact: {
          severity: number;
          scope: string[];
          duration: string;
        };
        resolution: {
          status: string;
          actions: string[];
          effectiveness: number;
        };
      }>;

      // Performance Factors
      factors: {
        [period: string]: {
          // Business Metrics
          conversionRate: {
            value: number;
            trend: number;
            benchmark: number;
          };
          avgDealSize: {
            value: number;
            trend: number;
            benchmark: number;
          };
          leadQuality: {
            value: number;
            components: Record<string, number>;
          };
          customerLTV: {
            current: number;
            predicted: number;
            confidence: number;
          };

          // Cost Metrics
          acquisitionCost: {
            total: number;
            byChannel: Record<string, number>;
            efficiency: number;
          };
          churnRate: {
            value: number;
            predictedNext: number;
            riskFactors: string[];
          };

          // Market Metrics
          competitiveIntensity: {
            score: number;
            factors: Record<string, number>;
          };
          marketSentiment: {
            score: number;
            drivers: Record<string, number>;
          };
          priceElasticity: {
            coefficient: number;
            confidence: number;
          };
        };
      };

      // Dynamic Thresholds
      adaptiveThresholds: Array<{
        metric: string;
        baseline: number;
        upperBound: number;
        lowerBound: number;
        adjustmentFactors: Record<string, number>;
        updateFrequency: string;
        lastUpdated: string;
      }>;
    }>()
    .notNull(),

  // Real-time Components
  realTimeModifiers: jsonb("realTimeModifiers").$type<{
    currentAnomalies: Array<{
      metric: string;
      deviation: number;
      significance: number;
      detectedAt: string;
      action: string;
      status: string;
    }>;
    activeEvents: Array<{
      type: string;
      impact: number;
      duration: string;
      startTime: string;
      expectedEndTime: string;
      mitigationStrategy: string;
      effectiveness: number;
    }>;
    marketConditions: {
      volatility: {
        current: number;
        trend: string;
        alerts: string[];
      };
      sentiment: {
        score: number;
        momentum: number;
        signals: Record<string, number>;
      };
      competitiveIntensity: {
        level: number;
        changes: Record<string, number>;
        threats: string[];
      };
    };
  }>(),
  createdAt: timestamp("createdAt", { withTimezone: true })
    .notNull()
    .$defaultFn(() => new Date()),
  // Model References
  modelId: text("modelId").references(() => seasonalModels.id),
  confidenceScore: decimal("confidenceScore", {
    precision: 4,
    scale: 3,
  }).notNull(),
  lastUpdated: timestamp("lastUpdated", { withTimezone: true }).notNull(),
  nextUpdate: timestamp("nextUpdate", { withTimezone: true }).notNull(),

  // Metadata
  metadata: jsonb("metadata").$type<{
    version: string;
    dataQuality: number;
    coverage: number;
    validationStatus: string;
    dataPoints: number;
  }>(),
});

export const seasonalAnalytics = pgTable("seasonalAnalytics", {
  id: text("id")
    .$defaultFn(() => createId())
    .notNull()
    .primaryKey(),
  patternId: text("patternId")
    .notNull()
    .references(() => seasonalPatterns.id),

  // Time Period Definition
  period: jsonb("period")
    .$type<{
      type: "season" | "month" | "quarter" | "custom" | "micro-season";
      start: string;
      end: string;
      characteristics: string[];
      significance: number;
    }>()
    .notNull(),

  // Comprehensive Metrics
  metrics: jsonb("metrics")
    .$type<{
      // Lead Generation & Conversion
      leads: {
        acquisition: {
          total: number;
          qualified: number;
          byChannel: Record<string, number>;
          bySource: Record<string, number>;
          quality: {
            distribution: Record<string, number>;
            averageScore: number;
            trends: Record<string, number>;
          };
          conversionRates: {
            overall: number;
            byStage: Record<string, number>;
            bySegment: Record<string, number>;
          };
        };

        // Behavioral Analytics
        behavior: {
          engagementScores: {
            average: number;
            distribution: number[];
            trends: Record<string, number>;
          };
          interactionPatterns: {
            frequency: Record<string, number>;
            intensity: Record<string, number>;
            preferences: Record<string, number>;
          };
          decisionSpeed: {
            average: number;
            bySegment: Record<string, number>;
            factors: Record<string, number>;
          };
          journeyMapping: {
            commonPaths: Array<{
              path: string[];
              frequency: number;
              conversionRate: number;
            }>;
            dropoffPoints: Record<string, number>;
          };
        };

        // Economic Impact
        economics: {
          acquisitionCost: {
            total: number;
            byChannel: Record<string, number>;
            efficiency: number;
          };
          valueGenerated: {
            total: number;
            projected: number;
            bySegment: Record<string, number>;
          };
          roi: {
            overall: number;
            byChannel: Record<string, number>;
            projected: number;
          };
        };
      };

      // Revenue Analytics
      revenue: {
        current: {
          total: number;
          breakdown: Record<string, number>;
          growth: number;
        };
        recurring: {
          total: number;
          retention: number;
          churn: number;
        };
        projected: {
          amount: number;
          confidence: number;
          scenarios: Record<string, number>;
        };
        byProduct: Record<
          string,
          {
            amount: number;
            growth: number;
            margin: number;
          }
        >;
        byCustomerSegment: Record<
          string,
          {
            amount: number;
            growth: number;
            potential: number;
          }
        >;
      };

      // Market Performance
      marketDynamics: {
        shareOfVoice: {
          overall: number;
          byChannel: Record<string, number>;
          trend: number;
        };
        competitivePressure: {
          index: number;
          factors: Record<string, number>;
          threats: string[];
        };
        marketSentiment: {
          score: number;
          drivers: Record<string, number>;
          trends: string[];
        };
        opportunityCost: {
          estimated: number;
          factors: Record<string, number>;
          mitigation: string[];
        };
      };
    }>()
    .notNull(),

  // Strategic Insights
  insights:
    jsonb("insights").$type<
      Array<{
        type: "trend" | "anomaly" | "opportunity" | "risk";
        category: string;
        description: string;
        significance: number;
        confidence: number;
        actionability: number;
        timeRelevance: string;
        impact: {
          scope: string[];
          magnitude: number;
          duration: string;
        };
        recommendations: Array<{
          action: string;
          priority: actionPriorityEnum;
          impact: {
            expected: number;
            timeframe: string;
            confidence: number;
          };
          effort: {
            level: number;
            resources: string[];
            timeline: string;
          };
          roi: {
            expected: number;
            paybackPeriod: string;
            risks: string[];
          };
        }>;
        validation: {
          method: string;
          score: number;
          references: string[];
        };
      }>
    >(),

  // Advanced Attribution
  attribution: jsonb("attribution").$type<{
    channels: {
      contribution: Record<string, number>;
      efficiency: Record<string, number>;
      trends: Record<string, number>;
    };
    touchpoints: Array<{
      position: string;
      channel: string;
      importance: number;
      effectiveness: number;
      costEfficiency: number;
    }>;
    models: {
      firstTouch: Record<string, number>;
      lastTouch: Record<string, number>;
      linear: Record<string, number>;
      timeDecay: Record<string, number>;
      customWeight: Record<string, number>;
    };
    analysis: {
      keyFindings: string[];
      recommendations: string[];
      opportunities: string[];
    };
  }>(),

  // Metadata
  metadata: jsonb("metadata").$type<{
    dataQuality: number;
    completeness: number;
    reliability: number;
    lastUpdated: string;
  }>(),

  created_at: timestamp("created_at", { withTimezone: true }).notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull(),
});

/**
 * Marketing & Testing
 * =================
 * Tables for A/B testing and nurture sequences
 */

export const abTestCampaigns = pgTable("abTestCampaign", {
  id: text("id")
    .$defaultFn(() => createId())
    .notNull()
    .primaryKey(),
  name: text("name").notNull(),
  startDate: timestamp("startDate", { withTimezone: true }).notNull(),
  endDate: timestamp("endDate", { withTimezone: true }),
  status: text("status").notNull(),
  variants: jsonb("variants").$type<{
    control: {
      id: string;
      content: Record<string, any>;
    };
    variations: Array<{
      id: string;
      content: Record<string, any>;
    }>;
  }>(),
  metrics: jsonb("metrics").$type<{
    [variantId: string]: {
      impressions: number;
      conversions: number;
      conversionRate: number;
    };
  }>(),
});

export const nurtureSequences = pgTable("nurtureSequence", {
  id: text("id")
    .$defaultFn(() => createId())
    .notNull()
    .primaryKey(),
  industry: text("industry").notNull(),
  season: text("season").notNull(),
  messageTemplate: jsonb("messageTemplate")
    .$type<{ subject: string; body: string }>()
    .notNull(),
  sequenceOrder: integer("sequenceOrder").notNull(),
  delayInDays: integer("delayInDays").notNull(),
  variationId: text("variationId"),
});

/**
 * Intelligence & Analytics
 * =====================
 * Tables for predictions, competitor analysis, and insights
 */

export const predictiveModels = pgTable("predictiveModel", {
  id: text("id")
    .$defaultFn(() => createId())
    .notNull()
    .primaryKey(),
  type: text("type").notNull(),
  parameters: jsonb("parameters").notNull(),
  accuracy: decimal("accuracy", { precision: 4, scale: 3 }),
  lastTrained: timestamp("lastTrained", { withTimezone: true }).notNull(),
  nextTrainingDue: timestamp("nextTrainingDue", { withTimezone: true }),
});

export const competitorAnalysis = pgTable("competitorAnalysis", {
  id: text("id")
    .$defaultFn(() => createId())
    .notNull()
    .primaryKey(),
  competitorName: text("competitorName").notNull(),
  activityType: text("activityType").notNull(),
  season: text("season"),
  impact: integer("impact").notNull(),
  description: text("description"),
  observedAt: timestamp("observedAt", { withTimezone: true }).notNull(),
});

export const insights = pgTable("insight", {
  id: text("id")
    .$defaultFn(() => createId())
    .notNull()
    .primaryKey(),
  type: text("type").notNull(),
  content: jsonb("content")
    .$type<{ message: string; actionRecommendation: string }>()
    .notNull(),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull(),
});

/**
 * Workflow & Automation
 * ===================
 * Tables for custom workflows and integrations
 */

export const workflows = pgTable("workflow", {
  id: text("id")
    .$defaultFn(() => createId())
    .notNull()
    .primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  trigger: jsonb("trigger").$type<{
    type: string;
    conditions: Array<{
      field: string;
      operator: string;
      value: any;
    }>;
  }>(),
  actions:
    jsonb("actions").$type<
      Array<{
        type: string;
        parameters: Record<string, any>;
      }>
    >(),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).notNull(),
});

export const integrationConfigs = pgTable("integrationConfig", {
  id: text("id")
    .$defaultFn(() => createId())
    .notNull()
    .primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  provider: text("provider").notNull(),
  config: jsonb("config").$type<{
    apiKeys?: Record<string, string>;
    webhooks?: Array<{
      url: string;
      events: string[];
      active: boolean;
    }>;
    mappings?: Record<string, string>;
  }>(),
  status: text("status").notNull(),
  lastSynced: timestamp("lastSynced", { withTimezone: true }),
});

/**
 * Team & Collaboration
 * ==================
 * Tables for team management and performance tracking
 */

export const teamMembers = pgTable("teamMember", {
  id: text("id")
    .$defaultFn(() => createId())
    .notNull()
    .primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  role: text("role").notNull(),
  permissions: jsonb("permissions").$type<string[]>().notNull(),
  assignedLeads: jsonb("assignedLeads").$type<string[]>(),
  lastActive: timestamp("lastActive", { withTimezone: true }),
});

export const performanceMetrics = pgTable("performanceMetric", {
  id: text("id")
    .$defaultFn(() => createId())
    .notNull()
    .primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  metric: text("metric").notNull(),
  value: decimal("value", { precision: 10, scale: 2 }).notNull(),
  dimension: jsonb("dimension").$type<{
    timeframe: string;
    segment: string;
    channel: string;
  }>(),
  timestamp: timestamp("timestamp", { withTimezone: true }).notNull(),
});

/**
 * Logging & Monitoring
 * ==================
 * Tables for system logging and monitoring
 */

export const logTypeEnum = pgEnum("logType", ["success", "error"]);
export const logPostTypeEnum = pgEnum("logPostType", [
  "http",
  "form",
  "webhook",
  "email",
]);

export const logs = pgTable("log", {
  id: text("id")
    .$defaultFn(() => createId())
    .notNull()
    .primaryKey(),
  endpointId: text("endpointId")
    .notNull()
    .references(() => endpoints.id, { onDelete: "cascade" }),
  type: logTypeEnum("type").notNull(),
  postType: logPostTypeEnum("postType").notNull(),
  message: jsonb("message").$type<Record<string, any> | unknown>().notNull(),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull(),
});

export const enhancedLogs = pgTable("enhancedLog", {
  id: text("id")
    .$defaultFn(() => createId())
    .notNull()
    .primaryKey(),
  category: text("category").notNull(), // e.g., 'system', 'security', 'user', 'integration'
  severity: text("severity").notNull(), // e.g., 'info', 'warning', 'error', 'critical'
  context: jsonb("context")
    .$type<{
      userId?: string;
      action: string;
      target: string;
      metadata: Record<string, any>;
    }>()
    .notNull(),
  timestamp: timestamp("timestamp", { withTimezone: true })
    .notNull()
    .defaultNow(),
  relatedEntityId: text("relatedEntityId"), // Optional reference to related entity (lead, user, etc.)
  relatedEntityType: text("relatedEntityType"), // Type of the related entity
  source: text("source").notNull(), // e.g., 'api', 'web', 'system', 'cron'
  stackTrace: text("stackTrace"), // For error logs
  duration: integer("duration"), // For performance logging (in milliseconds)
  ip: text("ip"), // For security and audit logging
  userAgent: text("userAgent"), // For user activity tracking
  tags: jsonb("tags").$type<string[]>(), // For flexible categorization
  resolved: boolean("resolved").default(false), // For tracking error resolution
  resolvedBy: text("resolvedBy"), // User who resolved the issue
  resolvedAt: timestamp("resolvedAt", { withTimezone: true }),
  notes: text("notes"), // Additional notes about the log entry
  retentionDays: integer("retentionDays").default(30), // How long to keep this log
});

/**
 * Lead Qualification & Routing
 * =========================
 * Tables for qualifying and routing leads based on rules
 */

export const leadQualificationRules = pgTable("leadQualificationRule", {
  id: text("id")
    .$defaultFn(() => createId())
    .notNull()
    .primaryKey(),
  name: text("name").notNull(),
  conditions: jsonb("conditions")
    .$type<
      Array<{
        field: string;
        operator: string;
        value: any;
        weight: number;
      }>
    >()
    .notNull(),
  minimumScore: integer("minimumScore").notNull(),
  industry: text("industry").notNull(),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).notNull(),
});

export const leadRoutingRules = pgTable("leadRoutingRule", {
  id: text("id")
    .$defaultFn(() => createId())
    .notNull()
    .primaryKey(),
  name: text("name").notNull(),
  priority: integer("priority").notNull(),
  conditions: jsonb("conditions")
    .$type<
      Array<{
        field: string;
        operator: string;
        value: any;
      }>
    >()
    .notNull(),
  assignTo: jsonb("assignTo")
    .$type<{
      type: "team" | "user" | "round_robin";
      targetIds: string[];
    }>()
    .notNull(),
  isActive: boolean("isActive").default(true),
});

/**
 * Communication & Follow-up
 * ======================
 * Tables for managing communication templates and follow-ups
 */

export const communicationTemplates = pgTable("communicationTemplate", {
  id: text("id")
    .$defaultFn(() => createId())
    .notNull()
    .primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // email, sms, in_app
  subject: text("subject"),
  content: text("content").notNull(),
  variables: jsonb("variables").$type<string[]>(),
  industry: text("industry"),
  season: text("season"),
  tags: jsonb("tags").$type<string[]>(),
  isActive: boolean("isActive").default(true),
});

export const followUpTasks = pgTable("followUpTask", {
  id: text("id")
    .$defaultFn(() => createId())
    .notNull()
    .primaryKey(),
  leadId: text("leadId")
    .notNull()
    .references(() => leads.id, { onDelete: "cascade" }),
  assignedTo: text("assignedTo")
    .notNull()
    .references(() => users.id),
  type: text("type").notNull(), // call, email, meeting
  priority: text("priority").notNull(), // high, medium, low
  dueDate: timestamp("dueDate", { withTimezone: true }).notNull(),
  status: text("status").notNull(), // pending, completed, overdue
  notes: text("notes"),
  completedAt: timestamp("completedAt", { withTimezone: true }),
});

/**
 * Revenue & Pipeline
 * ===============
 * Tables for tracking deals and revenue
 */

export const deals = pgTable("deal", {
  id: text("id")
    .$defaultFn(() => createId())
    .notNull()
    .primaryKey(),
  leadId: text("leadId")
    .notNull()
    .references(() => leads.id, { onDelete: "cascade" }),
  stage: text("stage").notNull(), // qualified, proposal, negotiation, closed_won, closed_lost
  value: decimal("value", { precision: 10, scale: 2 }).notNull(),
  probability: integer("probability").notNull(),
  expectedCloseDate: timestamp("expectedCloseDate", { withTimezone: true }),
  actualCloseDate: timestamp("actualCloseDate", { withTimezone: true }),
  reason: text("reason"), // For closed_won/lost
  notes: text("notes"),
});

export const pipelineStages = pgTable("pipelineStage", {
  id: text("id")
    .$defaultFn(() => createId())
    .notNull()
    .primaryKey(),
  name: text("name").notNull(),
  order: integer("order").notNull(),
  industry: text("industry"),
  expectedDurationDays: integer("expectedDurationDays"),
  requirements: jsonb("requirements").$type<string[]>(),
});

/**
 * Custom Fields & Forms
 * ==================
 * Tables for managing custom fields and form builders
 */

export const customFields = pgTable("customField", {
  id: text("id")
    .$defaultFn(() => createId())
    .notNull()
    .primaryKey(),
  name: text("name").notNull(),
  label: text("label").notNull(),
  type: text("type").notNull(), // text, number, date, select, etc.
  options: jsonb("options").$type<string[]>(),
  validation: jsonb("validation").$type<{
    required: boolean;
    pattern?: string;
    min?: number;
    max?: number;
  }>(),
  industry: text("industry"),
  isActive: boolean("isActive").default(true),
});

export const formBuilders = pgTable("formBuilder", {
  id: text("id")
    .$defaultFn(() => createId())
    .notNull()
    .primaryKey(),
  name: text("name").notNull(),
  fields: jsonb("fields")
    .$type<
      Array<{
        fieldId: string;
        order: number;
        required: boolean;
      }>
    >()
    .notNull(),
  styling: jsonb("styling").$type<{
    theme: string;
    colors: Record<string, string>;
    customCss?: string;
  }>(),
  settings: jsonb("settings").$type<{
    redirectUrl?: string;
    submitMessage?: string;
    enableRecaptcha: boolean;
  }>(),
});
