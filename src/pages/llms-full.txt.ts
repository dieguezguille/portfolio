import type { APIRoute } from "astro";

import documents from "../agents/documents";

export const GET: APIRoute = async () => {
  const pages = await documents();
  return new Response(pages.map((page) => page.body).join("\n---\n\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
