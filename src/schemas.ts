import { z } from "astro/zod";

const month = z.union([z.string().regex(/^\d{4}-(?:0[1-9]|1[0-2])$/), z.literal("TODO")]);
const period = z.strictObject({ start: month, end: month.optional() });
const link = z.url().optional();
const metric = z.union([
  z.strictObject({ label: z.string(), value: z.string() }),
  z.strictObject({ label: z.string(), stat: z.enum(["commits", "pulls", "releases"]) }),
]);

export const work = <T extends z.ZodType>(image: () => T) =>
  z.strictObject({
    title: z.string(),
    summary: z.string(),
    highlights: z.string().array().min(1).optional(),
    role: z.string(),
    team: z.string().optional(),
    period,
    stack: z.string().array().min(1),
    links: z.strictObject({ live: link, repo: link, ios: link, android: link }).default({}),
    metrics: metric.array().default([]),
    screens: z.strictObject({ image: image(), alt: z.string(), caption: z.string() }).array().default([]),
    job: z.string().optional(),
    draft: z.boolean().default(false),
  });

export const experience = z.strictObject({
  company: z.string(),
  url: z.url().optional(),
  showcase: z.strictObject({ title: z.string(), url: z.url() }).optional(),
  role: z.string(),
  period,
  previous: z.strictObject({ role: z.string(), end: month }).optional(),
  summary: z.string(),
  highlights: z.string().array().min(1),
});
