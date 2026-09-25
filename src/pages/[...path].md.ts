import type { APIRoute, InferGetStaticPropsType } from "astro";

import documents from "../agents/documents";

export async function getStaticPaths() {
  const pages = await documents();
  return pages.map((page) => ({ params: { path: new URL(page.url).pathname.slice(1, -3) }, props: page }));
}

export const GET: APIRoute<InferGetStaticPropsType<typeof getStaticPaths>> = (context) =>
  new Response(context.props.body, { headers: { "Content-Type": "text/markdown; charset=utf-8" } });
