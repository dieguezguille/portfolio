import { readFileSync } from "node:fs";

export default readFileSync("dist/sitemap-0.xml", "utf8")
  .matchAll(/<loc>https:\/\/guillermodieguez\.com([^<]*)<\/loc>/g)
  .map((match) => match[1] ?? "/")
  .toArray();
