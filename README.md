<!-- cspell:ignore inlines swiftshader -->

# guillermodieguez.com

personal portfolio of guillermo diéguez. astro 7, three.js r186, zero runtime frameworks.

## development

```sh
pnpm install
pnpm dev
```

- `pnpm build`: static build into `dist/`.
- `pnpm preview`: serves `dist/` on port 4321. the content security policy only applies here, never in `pnpm dev`.
- `?debug` on the home page, or the command palette, shows the lattice diagnostics.
- every page also builds as markdown for agents (`/index.md`, `/es/work/exa.md`), indexed in `/llms.txt` and joined in `/llms-full.txt`. `src/agents/documents.ts` writes them from the same content as the html.

## testing

- `pnpm test`: the gate. type checks, lint, format, spelling, vitest, build, markdown (including the generated pages) and the size budgets. the pre-commit hook runs the fast subset.
- `pnpm test:vi`: unit tests for the prng, the lattice geometry, the dither matrix, the quality governor, the scroll mapping, the dictionary, the content schemas and the worker.
- `pnpm test:budget`: gzips `dist/` and fails when a budget is exceeded. run it after `pnpm build`.
- `pnpm test:e2e`: playwright in chromium, firefox and webkit, desktop and mobile. smoke, axe, keyboard and resilience suites. run `pnpm exec playwright install` once, and `pnpm build` before.
- `pnpm test:lighthouse`: lighthouse ci against `dist/`, mobile preset, three runs, asserting the budgets.

visual regression runs only in ci, in its own `visual` workflow inside the official playwright container (`VISUAL=1`), so pixels stay stable. it does not gate the deploy, so a copy change ships without waiting for new baselines. when a screenshot differs, the run fails and uploads the diff report and the regenerated baselines as the `visual-baselines` artifact: review the report, then `gh run download <run> -n visual-baselines -D e2e` and commit the baselines.

## deployment

cloudflare workers static assets, configured in `wrangler.jsonc`: `dist/` is served as is, `404.html` pages handle misses per locale, and `drop-trailing-slash` redirects `/foo/` and `/foo.html` to `/foo`. `public/_headers` adds the headers a meta csp cannot carry, hsts and immutable caching for `/_astro/*`.

`src/agents/worker.ts` runs in front of every path except `/_astro/*` and `/og/*`. it serves a page's markdown to clients that send `Accept: text/markdown`, answers `curl`, `wget`, httpie and xh on `/` and `/es` with the ansi card that `src/agents/card.ts` writes to `/card.txt`, labels `.md` files as `text/markdown; charset=utf-8` with `x-robots-tag: noindex`, and adds `vary: accept` to html. everything else goes straight to the assets binding, which still applies `_headers`. those requests count toward the workers free plan, 100,000 a day; `wrangler dev` runs the same setup locally.

the `deploy` workflow runs after the `test` workflow (unit, e2e and lighthouse jobs) succeeds. `main` deploys to production; any other branch uploads a version with a preview url aliased to the branch name.

the workflow needs two repository secrets, created by the owner in github settings, never committed:

- `CLOUDFLARE_API_TOKEN`: an api token with `workers scripts: edit` and `workers routes: edit` on the account and zone, plus `dns: edit` on the zone for the custom domain.
- `CLOUDFLARE_ACCOUNT_ID`: the account id from the cloudflare dashboard.

## platform notes

findings from verifying the stack on 2026-09-25 that shape the code:

- astro's csp only hashes scripts it processes. `is:inline` scripts are not hashed, so every script goes through astro, and data blocks (`application/ld+json`) are the only inline exception because they never execute.
- the csp has no `'unsafe-inline'` for `style` attributes. never render a `style` attribute; runtime style changes go through the cssom, which csp allows.
- astro only inlines scripts without imports. anything that calls `import()` ships as a small module file instead of inline.
- the astro 7 compiler drops whitespace between text and an element across a line break, like jsx. write `{" "}` where a space matters.
- `build.format: "file"` makes `Astro.url.pathname` end in `.html`; the layout normalizes it once for canonicals and alternates.
- satori reads woff but not woff2, so og images use the static `@fontsource` files at build time.
- chrome without a gpu renders webgl through swiftshader, and `failIfMajorPerformanceCaveat` only rejects it as a fallback, not as the primary backend. creating that context blocks the main thread for about a second, so `src/lattice/probe.ts` creates it in a worker and skips the scene on software renderers. safari before 17 has no webgl in workers and keeps the fallback.
- firefox warns when `WEBGL_debug_renderer_info` is read and already reports the real renderer, so the probe only reads the extension when `RENDERER` is the masked `WebKit WebGL`.
- three logs a warning from `compileAsync` when `KHR_parallel_shader_compile` is missing, so the scene compiles synchronously there.
- `Timer` needs `reset()` when the loop resumes, or the first delta covers the whole pause.

## docs

- [conventions for humans and agents](AGENTS.md)
