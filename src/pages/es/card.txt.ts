import type { APIRoute } from "astro";

import card from "../../agents/card";

export const GET: APIRoute = async () =>
  new Response(await card("es"), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
