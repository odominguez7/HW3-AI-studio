import { z } from "zod";

export const VerifyEduSchema = z.object({
  email: z.string().email(),
  campus: z.enum(["mit", "harvard"]),
});

export const OnboardSchema = z.object({
  userId: z.string().min(1),
  automationMode: z.enum(["manual", "assisted", "autopilot"]),
  availabilityModes: z.array(
    z.enum(["casual", "study_only", "founder_mode", "zen_only"])
  ),
  calendarConnected: z.boolean(),
});

export const AffinityProfileSchema = z.object({
  userId: z.string().min(1),
  openness: z.number().min(0).max(1),
  conscientiousness: z.number().min(0).max(1),
  extraversion: z.number().min(0).max(1),
  agreeableness: z.number().min(0).max(1),
  neuroticism: z.number().min(0).max(1),
});

export const SparkCreateSchema = z.object({
  creatorId: z.string().min(1),
  sparkType: z.enum([
    "study_sync",
    "coffee_clash",
    "lunch_link",
    "walk_wave",
    "homework_hack",
    "recess_rush",
    "blitz_brainstorm",
  ]),
  locationHint: z.string().min(1),
  durationMinutes: z.number().int().min(15).max(180),
  startsAt: z.string().datetime(),
  visibility: z.enum(["public", "group_only", "invite_only"]).default("public"),
});

export const SparkCommitSchema = z.object({
  userId: z.string().min(1),
  note: z.string().max(280).optional(),
});

export const SparkFeedbackSchema = z.object({
  userId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  repeatInterest: z.boolean(),
  whatWorked: z.string().max(500),
});

export const OfferCreateSchema = z.object({
  userId: z.string().min(1),
  want: z.string().min(3).max(280),
  offer: z.string().min(3).max(280),
  preferredDurationMinutes: z.number().int().min(15).max(180).optional(),
});

export const TrustReportSchema = z.object({
  reporterId: z.string().min(1),
  targetUserId: z.string().min(1),
  sparkId: z.string().optional(),
  reason: z.enum(["safety", "harassment", "no_show", "other"]),
  details: z.string().min(3).max(1000),
});

export const TrustBlockSchema = z.object({
  requesterId: z.string().min(1),
  blockedUserId: z.string().min(1),
});

export const AgentRegisterSchema = z.object({
  name: z.string().min(1).max(120),
  capabilities: z.array(z.string().min(1).max(80)).min(1),
  endpoint: z.string().url(),
  contact_email: z.string().email().optional().or(z.literal("")),
  agent_type: z.enum([
    "study-helper",
    "founder-advisor",
    "wellness",
    "moderator",
    "custom",
  ]),
});

export const AgentStatusSchema = z.object({
  status: z.enum(["active", "paused"]),
});

export const AgentInteractSchema = z.object({
  task: z.string().min(1).max(2000),
  context: z.record(z.unknown()).optional(),
  meetmit_user: z.string().optional(),
});

export const AgentReportSchema = z.object({
  reason: z.string().min(1).max(120),
  details: z.string().max(1000).optional(),
  reporterId: z.string().optional(),
});
