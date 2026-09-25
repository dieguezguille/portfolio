import { readdir, readFile } from "node:fs/promises";
import { describe, expect, test } from "vitest";

import es from "./es.json";

describe("translations", () => {
  test("keys are sorted", () => {
    expect(Object.keys(es)).toStrictEqual(Object.keys(es).toSorted(order));
  });

  test("every key is used in the source", async () => {
    const files = await readdir("src", { recursive: true });
    const sources = await Promise.all(
      files.filter((file) => /\.(?:astro|ts)$/.test(file)).map((file) => readFile(`src/${file}`, "utf8")),
    );
    const source = sources.join("\n");
    expect(Object.keys(es).filter((key) => !source.includes(JSON.stringify(key)))).toStrictEqual([]);
  });

  test("every translation is written and keeps its placeholders", () => {
    for (const [key, value] of Object.entries(es)) {
      expect(value.trim()).not.toBe("");
      expect(value).not.toBe(key);
      expect(value.match(/\{\{\w+\}\}/g)).toStrictEqual(key.match(/\{\{\w+\}\}/g));
    }
  });

  test("every case study exists in both locales", async () => {
    const english = await readdir("src/content/work/en");
    const spanish = await readdir("src/content/work/es");
    expect(spanish.toSorted(order)).toStrictEqual(english.toSorted(order));
  });
});

function order(a: string, b: string) {
  return a.localeCompare(b);
}
