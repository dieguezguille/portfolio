import { z } from "astro/zod";

import github from "../github";
import profile from "../profile";

export default await Promise.all(
  profile.contributions.map(async (url): Promise<Contribution> => {
    const [, repo, number] = /^https:\/\/github\.com\/([\w.-]+\/[\w.-]+)(?:\/(?:issues|pull)\/(\d+))?$/.exec(url) ?? [];
    if (!repo) throw new Error(`${url} is not a github repository, issue or pull request`);
    if (!number) {
      const commits = `repos/${repo}/commits?author=${profile.handle}&per_page=1`;
      const [newest, metadata] = await Promise.all([github(commits), github(`repos/${repo}`)]);
      const last = /[?&]page=(\d+)>; rel="last"/.exec(newest.headers.get("link") ?? "")?.[1];
      const author = z.object({ date: z.coerce.date() });
      const oldest = last ? await github(`${commits}&page=${last}`) : newest;
      const [first] = z.tuple([z.object({ commit: z.object({ author }) })]).parse(await oldest.json());
      return {
        url,
        repo,
        title: z.object({ description: z.string() }).parse(await metadata.json()).description,
        kind: "contributor",
        year: first.commit.author.date.getUTCFullYear(),
      };
    }
    const response = await github(`repos/${repo}/issues/${number}`);
    const issue = z
      .object({
        title: z.string(),
        state: z.enum(["closed", "open"]),
        state_reason: z.string().nullable(),
        draft: z.boolean().optional(),
        created_at: z.coerce.date(),
        pull_request: z.object({ merged_at: z.coerce.date().nullable() }).optional(),
      })
      .parse(await response.json());
    if (issue.pull_request) {
      const merged = issue.pull_request.merged_at;
      return {
        url,
        repo,
        number: Number(number),
        title: issue.title,
        kind: "pull",
        state: merged ? "merged" : issue.draft && issue.state === "open" ? "draft" : issue.state,
        year: (merged ?? issue.created_at).getUTCFullYear(),
      };
    }
    return {
      url,
      repo,
      number: Number(number),
      title: issue.title,
      kind: "issue",
      state: issue.state_reason === "completed" ? "resolved" : issue.state,
      year: issue.created_at.getUTCFullYear(),
    };
  }),
);

type Contribution = { repo: string; title: string; url: string; year: number } & (
  | { kind: "contributor" }
  | { kind: "issue"; number: number; state: "closed" | "open" | "resolved" }
  | { kind: "pull"; number: number; state: "closed" | "draft" | "merged" | "open" }
);
