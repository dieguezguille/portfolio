import { getCollection } from "astro:content";

export default async function jobs(locale = "en") {
  const entries = await getCollection(locale === "es" ? "experienceEs" : "experienceEn");
  return entries.toSorted((a, b) => b.data.period.start.localeCompare(a.data.period.start));
}
