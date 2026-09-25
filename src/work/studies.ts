import { getCollection } from "astro:content";

export default async function studies(locale = "en") {
  const entries = await getCollection("work", (entry) => entry.id.startsWith(`${locale}/`) && !entry.data.draft);
  return entries
    .toSorted((a, b) => b.data.period.start.localeCompare(a.data.period.start))
    .map((entry) => ({ ...entry, slug: entry.id.slice(locale.length + 1) }));
}
