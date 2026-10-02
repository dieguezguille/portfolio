import { z } from "astro/zod";

import github from "../github";
import profile from "../profile";

const query = [
  `author:${profile.handle}`,
  `-user:${profile.handle}`,
  "is:public",
  ...profile.contributions.hidden.map((name) => `-${name.includes("/") ? "repo" : "user"}:${name}`),
].join(" ");
const search = await github(`search/issues?sort=created&per_page=100&q=${encodeURIComponent(query)}`);
const issue = z.object({
  html_url: z.string(),
  repository_url: z.string(),
  number: z.number(),
  title: z.string(),
  state: z.enum(["closed", "open"]),
  state_reason: z.string().nullable(),
  draft: z.boolean().optional(),
  created_at: z.coerce.date(),
  pull_request: z.object({ merged_at: z.coerce.date().nullable() }).optional(),
});

export default [
  ...(await Promise.all(
    profile.contributions.core.map(async (repo): Promise<Contribution> => {
      const commits = `repos/${repo}/commits?author=${profile.handle}&per_page=1`;
      const [newest, metadata] = await Promise.all([github(commits), github(`repos/${repo}`)]);
      const last = /[?&]page=(\d+)>; rel="last"/.exec(newest.headers.get("link") ?? "")?.[1];
      const author = z.object({ date: z.coerce.date() });
      const oldest = last ? await github(`${commits}&page=${last}`) : newest;
      const [first] = z.tuple([z.object({ commit: z.object({ author }) })]).parse(await oldest.json());
      return {
        url: `https://github.com/${repo}`,
        repo,
        title: z.object({ description: z.string() }).parse(await metadata.json()).description,
        kind: "contributor",
        year: first.commit.author.date.getUTCFullYear(),
      };
    }),
  )),
  ...z
    .object({ items: z.array(issue) })
    .parse(await search.json())
    .items.map((item): Contribution => {
      const repo = item.repository_url.replace("https://api.github.com/repos/", "");
      if (item.pull_request) {
        const merged = item.pull_request.merged_at;
        return {
          url: item.html_url,
          repo,
          number: item.number,
          title: item.title,
          kind: "pull",
          state: merged ? "merged" : item.draft && item.state === "open" ? "draft" : item.state,
          year: (merged ?? item.created_at).getUTCFullYear(),
        };
      }
      return {
        url: item.html_url,
        repo,
        number: item.number,
        title: item.title,
        kind: "issue",
        state: item.state_reason === "completed" ? "resolved" : item.state,
        year: item.created_at.getUTCFullYear(),
      };
    }),
];

type Contribution = { repo: string; title: string; url: string; year: number } & (
  | { kind: "contributor" }
  | { kind: "issue"; number: number; state: "closed" | "open" | "resolved" }
  | { kind: "pull"; number: number; state: "closed" | "draft" | "merged" | "open" }
);
