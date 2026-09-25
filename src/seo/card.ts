import { Resvg } from "@resvg/resvg-js";
import { readFile } from "node:fs/promises";
import satori from "satori";

import motif from "../lattice/motif";
import monogram from "../monogram/monogram";
import colors from "../styles/palette";

export default async function card(content: { label: string; subtitle: string; title: string }) {
  const art = motif(80, 90);
  const header = element("div", { alignItems: "center", gap: 20 }, [
    image(65, 35, monogram.viewBox, [
      [monogram.letters, colors.fg],
      [monogram.dot, colors.accent],
    ]),
    element("div", { fontFamily: "Geist Mono", fontSize: 20, letterSpacing: 2, color: colors.muted }, [
      content.label.toUpperCase(),
    ]),
  ]);
  const text = element("div", { flexDirection: "column", gap: 24 }, [
    element(
      "div",
      { fontSize: content.title.length > 14 ? 76 : 96, fontWeight: 600, letterSpacing: -3, lineHeight: 0.95 },
      [content.title],
    ),
    element("div", { fontSize: 30, lineHeight: 1.3, color: colors.muted }, [content.subtitle]),
    element("div", { fontFamily: "Geist Mono", fontSize: 20, letterSpacing: 1 }, ["guillermodieguez.com"]),
  ]);
  const column = element(
    "div",
    { flexDirection: "column", justifyContent: "space-between", width: 640, padding: "64px 56px 64px 72px" },
    [header, text],
  );
  const root = element("div", { width: "100%", height: "100%", background: colors.bg, color: colors.fg }, [
    column,
    image(560, 630, "0 0 80 90", [
      [art.foreground, colors.fg],
      [art.accent, colors.accent],
    ]),
  ]);
  const fonts = [
    { name: "Geist", data: await font("geist/files/geist-latin-500-normal.woff"), weight: 500 as const },
    { name: "Geist", data: await font("geist/files/geist-latin-600-normal.woff"), weight: 600 as const },
    { name: "Geist Mono", data: await font("geist-mono/files/geist-mono-latin-400-normal.woff"), weight: 400 as const },
  ];
  return new Resvg(await satori(root, { width: 1200, height: 630, fonts })).render().asPng();
}

function element(type: string, style: Record<string, number | string>, children: unknown[], attributes = {}) {
  return { type, props: { style: { display: "flex", ...style }, children, ...attributes } };
}

function image(width: number, height: number, viewBox: string, paths: [string, string][]) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" shape-rendering="crispEdges">${paths.map(([d, fill]) => `<path d="${d}" fill="${fill}"/>`).join("")}</svg>`;
  return element("img", { width, height }, [], { src: `data:image/svg+xml,${encodeURIComponent(svg)}`, width, height });
}

function font(path: string) {
  return readFile(`node_modules/@fontsource/${path}`);
}
