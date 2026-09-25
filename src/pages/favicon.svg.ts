import type { APIRoute } from "astro";

import monogram from "../monogram/monogram";
import palette from "../styles/palette";

export const GET: APIRoute = () =>
  new Response(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-1 -4 16 16" shape-rendering="crispEdges"><style>path{fill:${palette.fg}}@media (prefers-color-scheme:light){path{fill:${palette.bg}}}path+path{fill:${palette.accent}}</style><path d="${monogram.letters}"/><path d="${monogram.dot}"/></svg>`,
    { headers: { "Content-Type": "image/svg+xml" } },
  );
