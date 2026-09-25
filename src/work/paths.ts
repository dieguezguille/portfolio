import studies from "./studies";

export default async function paths(locale: string) {
  const entries = await studies(locale);
  return entries.map((entry, index) => ({
    params: { slug: entry.slug },
    props: { entry, next: entries[index + 1], previous: entries[index - 1] },
  }));
}
