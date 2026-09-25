import type { APIRoute } from "astro";

import build from "../../footer/build";
import profile from "../../profile";

export const GET: APIRoute = ({ site }) =>
  new Response(
    [
      `Contact: mailto:${profile.email}`,
      `Expires: ${new Date(build.date.getTime() + 364 * 24 * 60 * 60 * 1000).toISOString()}`,
      "Preferred-Languages: en, es",
      `Canonical: ${new URL("/.well-known/security.txt", site).href}`,
      "",
    ].join("\n"),
  );
