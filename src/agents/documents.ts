import { getRelativeLocaleUrl } from "astro:i18n";

import capabilities from "../capabilities/capabilities";
import contributions from "../contributions/contributions";
import label from "../contributions/label";
import when from "../contributions/when";
import facts from "../cv/facts";
import summary from "../cv/summary";
import jobs from "../experience/jobs";
import period from "../i18n/period";
import translations from "../i18n/translations";
import profile from "../profile";
import studies from "../work/studies";
import value from "../work/value";
import markdown from "./markdown";

export default async function documents() {
  const pages = [];
  for (const locale of ["en", "es"]) {
    const t = translations(locale);
    const link = (path?: string) => new URL(markdown(getRelativeLocaleUrl(locale, path)), import.meta.env.SITE).href;
    const entries = await studies(locale);
    const roles = await jobs(locale);
    const contact = list([
      `${t("Remote from Argentina")}, UTC−3`,
      `Email: <${profile.email}>`,
      `GitHub: <${profile.github}>`,
      `LinkedIn: <${profile.linkedin}>`,
      `CV: <${link("cv")}>`,
    ]);
    const positions = (job: (typeof roles)[number]) => {
      const company = job.data.url ? `[${job.data.company}](${job.data.url})` : job.data.company;
      return job.data.previous
        ? `**${job.data.role}**, ${company}, ${period({ start: job.data.previous.end }, locale)}. ${job.data.previous.role}, ${period({ start: job.data.period.start, end: job.data.previous.end }, locale)}.`
        : `**${job.data.role}**, ${company}, ${period(job.data.period, locale)}.`;
    };
    const background = (level: string) =>
      facts(t).flatMap((group) => [
        `${level} ${group.name}`,
        list(
          group.items.map(
            (item) =>
              `**${item.name}**${item.period ? ` (${item.period})` : ""}${item.detail ? `: ${item.detail}` : ""}`,
          ),
        ),
      ]);
    const skills = list(
      capabilities(t).map(
        (group) => `**${group.name}**: ${group.items.map((item) => `[${item.name}](${item.url})`).join(", ")}`,
      ),
    );
    const contributed = list(
      contributions.map(
        (contribution) =>
          `[${contribution.repo}${"number" in contribution ? `#${String(contribution.number)}` : ""}](${contribution.url}): ${contribution.title.replaceAll(/[[\]]/g, String.raw`\$&`)}. ${label(contribution, t)}, ${when(contribution, t)}.`,
      ),
    );
    const role = `${t("Head of frontend at")} [${profile.employer.name}](${profile.employer.url}).`;

    pages.push(
      {
        locale,
        url: link(),
        title: profile.name,
        description: t("Profile, selected work, experience, capabilities, contributions and contact."),
        body: [
          `# ${profile.name}`,
          role,
          t("My team and I build the Exa App, a self-custodial wallet with a Visa card, for iOS, Android and the web."),
          contact,
          `## ${t("Selected work")}`,
          list(entries.map((entry) => `[${entry.data.title}](${link(`work/${entry.slug}`)}): ${entry.data.summary}`)),
          `## ${t("Experience")}`,
          list(
            roles.map((job) =>
              [
                positions(job),
                job.data.summary,
                ...(job.data.showcase ? [`[${job.data.showcase.title}](${job.data.showcase.url}).`] : []),
              ].join(" "),
            ),
          ),
          ...background("###"),
          `## ${t("Capabilities")}`,
          skills,
          `## ${t("Contributions")}`,
          contributed,
        ],
      },
      {
        locale,
        url: link("cv"),
        title: `CV — ${profile.name}`,
        description: t(
          "One-page CV of Guillermo Diéguez, head of frontend at Exa Labs, remote from Argentina: experience, capabilities, contributions, education and languages.",
        ),
        body: [
          `# CV — ${profile.name}`,
          role,
          summary(t, roles.at(-1)?.data.period.start),
          contact,
          `## ${t("Experience")}`,
          list(
            roles.map((job) =>
              [
                positions(job),
                ...job.data.highlights.map((item) => `  - ${item}`),
                ...entries
                  .filter((entry) => entry.data.job === job.id)
                  .map((entry) => `  - [${t("Case study")}: ${entry.data.title}](${link(`work/${entry.slug}`)})`),
              ].join("\n"),
            ),
          ),
          `## ${t("Freelance work")}`,
          list(
            entries
              .filter((entry) => entry.data.job === undefined)
              .map(
                (entry) =>
                  `**${entry.data.role}**, [${entry.data.title}](${link(`work/${entry.slug}`)}), ${period(entry.data.period, locale)}. ${(entry.data.highlights ?? [entry.data.summary]).join(" ")}`,
              ),
          ),
          `## ${t("Capabilities")}`,
          skills,
          `## ${t("Contributions")}`,
          contributed,
          ...background("##"),
        ],
      },
      ...entries.map((entry) => {
        const job = roles.find((item) => item.id === entry.data.job);
        return {
          locale,
          url: link(`work/${entry.slug}`),
          title: entry.data.title,
          description: entry.data.summary,
          body: [
            `# ${entry.data.title}`,
            entry.data.summary,
            list([
              `${t("Role")}: ${job?.data.previous ? `${entry.data.role}, ${period({ start: job.data.previous.end, end: job.data.period.end }, locale)}; ${job.data.previous.role}, ${period({ start: job.data.period.start, end: job.data.previous.end }, locale)}` : entry.data.role}`,
              `${t("Period")}: ${period(entry.data.period, locale)}`,
              ...(entry.data.team ? [`${t("Team")}: ${entry.data.team}`] : []),
              `Stack: ${entry.data.stack.join(", ")}`,
              ...(entry.data.links.live ? [`${t("Live")}: <${entry.data.links.live}>`] : []),
              ...(entry.data.links.repo ? [`${t("Source")}: <${entry.data.links.repo}>`] : []),
              ...(entry.data.links.ios ? [`App Store: <${entry.data.links.ios}>`] : []),
              ...(entry.data.links.android ? [`Google Play: <${entry.data.links.android}>`] : []),
            ]),
            ...(entry.data.metrics.length > 0
              ? [
                  `## ${t("Numbers")}`,
                  list(entry.data.metrics.map((metric) => `**${metric.label}**: ${value(metric, locale)}`)),
                ]
              : []),
            ...(entry.data.screens.length > 0
              ? [`## ${t("Screens")}`, list(entry.data.screens.map((screen) => `**${screen.caption}**: ${screen.alt}`))]
              : []),
            entry.body?.trim() ?? "",
          ],
        };
      }),
    );
  }
  return pages.map(({ body, ...page }) => ({ ...page, body: `${body.join("\n\n")}\n` }));
}

function list(items: string[]) {
  return items.map((item) => `- ${item}`).join("\n");
}
