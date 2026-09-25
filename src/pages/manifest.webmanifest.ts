import type { APIRoute } from "astro";

import profile from "../profile";
import palette from "../styles/palette";

export const GET: APIRoute = () =>
  Response.json({
    name: profile.name,
    short_name: "GD",
    start_url: "/",
    display: "browser",
    background_color: palette.bg,
    theme_color: palette.bg,
    icons: [
      { src: "/favicon.svg", type: "image/svg+xml", sizes: "any" },
      { src: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
  });
