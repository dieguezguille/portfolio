import type { APIRoute } from "astro";

import documents from "../agents/documents";
import translations from "../i18n/translations";
import profile from "../profile";

export const GET: APIRoute = async (context) => {
  const pages = await documents();
  const full = new URL("/llms-full.txt", context.site).href;
  const section = (locale: string) =>
    pages
      .filter((page) => page.locale === locale)
      .map((page) => `- [${page.title}](${page.url}): ${page.description}`)
      .join("\n");
  return new Response(
    [
      `# ${profile.name}`,
      `> ${translations("en")("Head of frontend at Exa Labs, remote from Argentina. My team and I build the Exa App, a self-custodial wallet with a Visa card, in React Native and TypeScript.")}`,
      "Every page of this site is also served as markdown: add `.md` to its path, or request it with `Accept: text/markdown`.",
      "## English",
      section("en"),
      "## Español",
      section("es"),
      "## Optional",
      `- [llms-full.txt](${full}): every page above, in one file`,
    ].join("\n\n") + "\n",
    { headers: { "Content-Type": "text/plain; charset=utf-8" } },
  );
};
