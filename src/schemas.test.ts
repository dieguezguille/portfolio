import { z } from "astro/zod";

import { readdir, readFile } from "node:fs/promises";
import { describe, expect, test } from "vitest";
import { parse } from "yaml";

import { experience, work as schema } from "./schemas";

const work = schema(() => z.string());

const sample = {
  title: "Title",
  summary: "Summary",
  role: "Role",
  period: { start: "2024-07" },
  stack: ["TypeScript"],
};

describe("work schema", () => {
  test("accepts a minimal entry and fills defaults", () => {
    expect(work.parse(sample)).toMatchObject({ links: {}, metrics: [], draft: false });
  });

  test("accepts a todo marker instead of a date", () => {
    expect(work.safeParse({ ...sample, period: { start: "TODO" } }).success).toBe(true);
  });

  test.each([
    ["an invalid month", { period: { start: "2024-13" } }],
    ["an empty stack", { stack: [] }],
    ["empty highlights", { highlights: [] }],
    ["an unknown field", { tags: [] }],
    ["an unknown stat", { metrics: [{ label: "Stars", stat: "stars" }] }],
    ["a relative link", { links: { live: "/work" } }],
  ])("rejects %s", (_, override) => {
    expect(work.safeParse({ ...sample, ...override }).success).toBe(false);
  });

  test("validates every case study file", async () => {
    for (const locale of ["en", "es"]) {
      const names = await readdir(`src/content/work/${locale}`);
      for (const name of names) {
        const source = await readFile(`src/content/work/${locale}/${name}`, "utf8");
        const frontmatter = /^---\n([\s\S]*?)\n---/.exec(source)?.[1] ?? "";
        expect(work.safeParse(parse(frontmatter)).error, `${locale}/${name}`).toBeUndefined();
      }
    }
  });

  test("links case studies only to existing jobs", async () => {
    for (const locale of ["en", "es"]) {
      const jobs = Object.keys(parse(await readFile(`src/content/experience/${locale}.yaml`, "utf8")) as object);
      const names = await readdir(`src/content/work/${locale}`);
      const sources = await Promise.all(names.map((name) => readFile(`src/content/work/${locale}/${name}`, "utf8")));
      const references = sources.flatMap(
        (source) => work.parse(parse(/^---\n([\s\S]*?)\n---/.exec(source)?.[1] ?? "")).job ?? [],
      );
      expect(references).not.toHaveLength(0);
      expect(jobs).toEqual(expect.arrayContaining(references));
    }
  });
});

describe("experience schema", () => {
  test("validates every experience file", async () => {
    for (const locale of ["en", "es"]) {
      const entries = parse(await readFile(`src/content/experience/${locale}.yaml`, "utf8")) as Record<string, unknown>;
      for (const [id, entry] of Object.entries(entries)) {
        expect(experience.safeParse(entry).error, `${locale}/${id}`).toBeUndefined();
      }
    }
  });
});
