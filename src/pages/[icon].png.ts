import type { APIRoute, InferGetStaticPropsType } from "astro";

import { Resvg } from "@resvg/resvg-js";

import monogram from "../monogram/monogram";
import palette from "../styles/palette";

export function getStaticPaths() {
  return [
    { params: { icon: "apple-touch-icon" }, props: { size: 180 } },
    { params: { icon: "icon" }, props: { size: 512 } },
  ];
}

export const GET: APIRoute<InferGetStaticPropsType<typeof getStaticPaths>> = ({ props: { size } }) => {
  const scale = Math.floor((size * 0.56) / 13);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="${palette.bg}"/><g transform="translate(${Math.round((size - 13 * scale) / 2)} ${Math.round((size - 7 * scale) / 2)}) scale(${scale})"><path d="${monogram.letters}" fill="${palette.fg}"/><path d="${monogram.dot}" fill="${palette.accent}"/></g></svg>`;
  return new Response(new Uint8Array(new Resvg(svg).render().asPng()), { headers: { "Content-Type": "image/png" } });
};
