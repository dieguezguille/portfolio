import type { APIRoute, InferGetStaticPropsType } from "astro";

import translations from "../../i18n/translations";
import profile from "../../profile";
import card from "../../seo/card";
import studies from "../../work/studies";

export async function getStaticPaths() {
  const pages = [];
  for (const locale of ["en", "es"]) {
    const t = translations(locale);
    const entries = await studies(locale);
    const prefix = locale === "en" ? "" : `${locale}/`;
    pages.push(
      {
        path: locale === "en" ? "index" : locale,
        title: profile.name,
        subtitle: t(
          "My team and I build the Exa App, a self-custodial wallet with a Visa card, for iOS, Android and the web.",
        ),
        label: t("Head of frontend"),
      },
      {
        path: `${prefix}cv`,
        title: profile.name,
        subtitle: t(
          "One-page CV of Guillermo Diéguez, head of frontend at Exa Labs, remote from Argentina: experience, capabilities, contributions, education and languages.",
        ),
        label: t("Curriculum vitae"),
      },
      {
        path: `${prefix}404`,
        title: t("Nothing at this address."),
        subtitle: t("The page you asked for does not exist or has moved."),
        label: "Error 404",
      },
      ...entries.map((entry) => ({
        path: `${prefix}work/${entry.slug}`,
        title: entry.data.title,
        subtitle: entry.data.summary,
        label: t("Case study"),
      })),
    );
  }
  return pages.map(({ path, ...content }) => ({ params: { path: `${path}.png` }, props: content }));
}

export const GET: APIRoute<InferGetStaticPropsType<typeof getStaticPaths>> = async (context) =>
  new Response(new Uint8Array(await card(context.props)), { headers: { "Content-Type": "image/png" } });
