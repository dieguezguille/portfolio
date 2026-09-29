import type translations from "../i18n/translations";
import type contributions from "./contributions";

export default function label(contribution: (typeof contributions)[number], t: ReturnType<typeof translations>) {
  switch (contribution.kind) {
    case "contributor":
      return t("Core contributor");
    case "issue":
      return t(issues[contribution.state]);
    case "pull":
      return t(pulls[contribution.state]);
  }
}

const issues = { closed: "Bug report, closed", open: "Bug report, open", resolved: "Bug report, resolved" } as const;
const pulls = {
  closed: "Pull request, closed",
  draft: "Pull request, draft",
  merged: "Pull request, merged",
  open: "Pull request, open",
} as const;
