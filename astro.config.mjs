import { defineConfig, fontProviders } from "astro/config";

import sitemap from "@astrojs/sitemap";

import pdf from "./src/cv/pdf.ts";

export default defineConfig({
  site: "https://guillermodieguez.com",
  trailingSlash: "never",
  build: { format: "file" },
  i18n: { locales: ["en", "es"], defaultLocale: "en", routing: { prefixDefaultLocale: false } },
  integrations: [pdf(), sitemap({ i18n: { defaultLocale: "en", locales: { en: "en", es: "es" } } })],
  markdown: { syntaxHighlight: false },
  prefetch: true,
  vite: { build: { chunkSizeWarningLimit: 600 } },
  security: { csp: { directives: ["default-src 'self'", "img-src 'self' data:"] } },
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: "Geist",
      cssVariable: "--font-sans",
      weights: ["100 900"],
      styles: ["normal"],
      subsets: ["latin"],
    },
    {
      provider: fontProviders.fontsource(),
      name: "Geist Mono",
      cssVariable: "--font-mono",
      weights: ["100 900"],
      styles: ["normal"],
      subsets: ["latin"],
      fallbacks: ["monospace"],
    },
  ],
});
