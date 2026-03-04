import { z } from "zod";

// Shared request/response contracts for a Serendipity HTTP rewrite.
// These are framework-agnostic and can be used in Next.js route handlers.

export const VerificationSchema = z.object({
  email: z.string().email(),
  campus: z.enum(["mit", "harvard"]),
});

export const OnboardingSchema = z.object({
  userId: z.string().min(1),
  automationMode: z.enum(["manual", "assisted", "autopilot"]),
  availabilityMode: z.array(
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
  startsAtIso: z.string().datetime(),
  visibility: z.enum(["public", "group_only", "invite_only"]),
});

export const SparkCommitSchema = z.object({
  sparkId: z.string().min(1),
  userId: z.string().min(1),
  note: z.string().max(280).optional(),
});

export const SparkFeedbackSchema = z.object({
  sparkId: z.string().min(1),
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

export type ApiRoute = {
  method: "GET" | "POST";
  path: string;
  bodySchema?: z.ZodTypeAny;
  description: string;
};

export const SerendipityApiRoutes: ApiRoute[] = [
  {
    method: "POST",
    path: "/api/users/verify-edu",
    bodySchema: VerificationSchema,
    description: "Verify campus email and enrollment gate.",
  },
  {
    method: "POST",
    path: "/api/users/onboard",
    bodySchema: OnboardingSchema,
    description: "Persist onboarding preferences and automation mode.",
  },
  {
    method: "POST",
    path: "/api/affinity/profile",
    bodySchema: AffinityProfileSchema,
    description: "Store or update Big Five affinity profile.",
  },
  {
    method: "GET",
    path: "/api/sparks/recommendations",
    description: "Return personalized spark opportunities.",
  },
  {
    method: "POST",
    path: "/api/sparks/create",
    bodySchema: SparkCreateSchema,
    description: "Create a new spark opportunity.",
  },
  {
    method: "POST",
    path: "/api/sparks/:id/commit",
    bodySchema: SparkCommitSchema,
    description: "Commit to attend an existing spark.",
  },
  {
    method: "POST",
    path: "/api/sparks/:id/feedback",
    bodySchema: SparkFeedbackSchema,
    description: "Store post-meet quality feedback.",
  },
  {
    method: "POST",
    path: "/api/offers/create",
    bodySchema: OfferCreateSchema,
    description: "Create a value-for-value want/offer post.",
  },
  {
    method: "GET",
    path: "/api/insights/campus",
    description: "Return aggregate, privacy-safe campus insights.",
  },
  {
    method: "POST",
    path: "/api/trust/report",
    bodySchema: TrustReportSchema,
    description: "Report a trust/safety incident.",
  },
  {
    method: "POST",
    path: "/api/trust/block",
    bodySchema: TrustBlockSchema,
    description: "Block another user immediately.",
  },
];

