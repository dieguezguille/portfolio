import { z } from "astro/zod";

import profile from "../profile";

import type { work } from "../schemas";

export default function value(metric: z.infer<ReturnType<typeof work>>["metrics"][number], locale = "en") {
  return "value" in metric
    ? metric.value
    : new Intl.NumberFormat(locale, { useGrouping: "always" }).format(stats[metric.stat]);
}

const [commits, pulls, releases] = await Promise.all([
  github(`repos/exactly/exa/commits?author=${profile.handle}&per_page=1`),
  github(`search/issues?q=repo:exactly/exa+is:pr+is:merged+author:${profile.handle}&per_page=1`),
  github("repos/exactly/exa/git/matching-refs/tags/@exactly/mobile@"),
]);
const count = z.coerce.number().int().positive();
const stats = z.strictObject({ commits: count, pulls: count, releases: count }).parse({
  commits: /[?&]page=(\d+)>; rel="last"/.exec(commits.headers.get("link") ?? "")?.[1],
  pulls: z.object({ total_count: z.number() }).parse(await pulls.json()).total_count,
  releases: z.array(z.unknown()).parse(await releases.json()).length,
});

async function github(path: string) {
  const response = await fetch(`https://api.github.com/${path}`, {
    headers: {
      accept: "application/vnd.github+json",
      ...(process.env.GITHUB_TOKEN && { authorization: `Bearer ${process.env.GITHUB_TOKEN}` }),
    },
  });
  if (!response.ok) throw new Error(`github answered ${String(response.status)} to ${path}`);
  return response;
}
