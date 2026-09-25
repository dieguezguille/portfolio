<!-- markdownlint-disable MD025 -->
<!-- cspell:ignore greppable janky -->

# context: project rules & conventions

## core philosophy

this site is a calling card. every detail is read as a signal of how its author works: a janky frame, a layout shift, a typo or a failing lint job is evidence against the claim the site exists to make. fight entropy. leave the codebase better than you found it.

- **simplicity and clarity**: write code that is easy to read, understand, and maintain. avoid cleverness for its own sake. prefer explicit over implicit.
- **consistency**: consistency is more important than personal preference. adhere to the established patterns in the codebase.
- **strictness**: high. follow the linter and formatter strictly. no `any` type.
- **performance is a feature**: the budgets that `pnpm test:budget` and `pnpm test:lighthouse` enforce are hard limits, not aspirations. a change that breaks a budget is a broken change.
- **content is dom**: every word a visitor or a crawler must read lives in server-rendered html. the canvas is decoration and never carries information.
- **prose style**: **all internal documentation and commit messages must be lowercase**.
- **diff-friendliness**: diffs matter. avoid adding items at the end of json/array lists (add in the middle or sorted position). trailing commas everywhere. structure code so changes are minimal and reviewable.
- **obsessive attention to detail**: every line of code, every pixel and every commit message reflects the quality of the project.

## aesthetics

code is read far more often than it is written. visual harmony is not vanity — it directly affects readability, cognitive load, and the willingness of developers to maintain a codebase with care. ugly code invites more ugly code. beautiful code raises the bar.

- **prefer single words**: the most elegant identifier is a single word. it needs no separator, obeys every casing convention at once, and is always the shortest option.
- **`snake_case` is prohibited by default**: `camelCase` for variables and functions, `PascalCase` for types, components, and events, `kebab-case` for files, directories, and anything else. the only exceptions are external boundaries you cannot control (a third-party api contract, glsl built-ins).

## naming philosophy ("long names are long")

- **omit redundant type names**: ✅ `const users: User[]` ❌ `const userList: User[]`
- **omit contextual names**: ✅ `class Scene { resize() }` ❌ `class Scene { resizeScene() }`
- **omit meaningless words**: `data`, `state`, `manager`, `engine`, `object`, `entity`, `instance`.
- **use plurals for collections**: a plural noun describing the contents, never a singular noun describing the container.
- **framework abbreviations are ok**: `t` for translations, `ref`, `gl`, `uv`, `dpr`. shorter scope, shorter name.
- **glsl follows the same rules**: `uniform float time;` not `uniform float uTime;`, unless a name collides with a built-in.

## capitalization

- **internal documentation prose** (`AGENTS.md`, `README.md`, code comments, commit messages): lowercase, including proper nouns and brand names.
- **referring to code in prose**: use regular lowercase words. the correctly-cased identifier only appears inside backticks.
- **user-facing copy** (anything rendered on the site): proper sentence case, in both english and spanish. never title case, never all caps in the source — uppercase labels are a css concern (`text-transform`).

## file naming

- **directories**: always `kebab-case`.
- **route files** (`src/pages/`): `kebab-case`.
- **all other files**: named identically to their `default` export. astro components are `PascalCase.astro`.
- **multiple exports**: `camelCase`, with a strong preference for a single word.
- **shaders**: `kebab-case.glsl` / `.vert` / `.frag`, imported with `?raw`.

## file structure

- **colocation**: a component, its styles, its client script, its shaders and its tests live in the same directory.
- **feature-based directories**: group by feature (`src/hero/`, `src/work/`), not by type (`src/shaders/`, `src/utils/`).
- **file ordering**: the default export goes first. extracted helpers, internal constants and types go at the bottom, ordered by relevance.

## code formatting

- **maximum compactness**: do not introduce line breaks inside objects, arrays, or argument lists by hand. prettier breaks lines only when they exceed `printWidth` (120).
- **css**: native css only — custom properties, nesting, cascade layers, container queries, `light-dark()`, logical properties. no utility framework, no preprocessor.

## comments

this codebase does not use comments. the only exceptions are static analysis annotations (`@ts-expect-error`, `eslint-disable`, `cspell:ignore`) and `TODO`/`HACK`/`FIXME` markers. if code needs explanation, rewrite it until it doesn't.

- **same-line form**: use the same-line form of a suppression; next-line or block only when the tool has no same-line variant. `@ts-expect-error`, never `@ts-ignore`. explanations are brutally concise and lowercase.
- **`cspell:ignore`**: inline for one-off words. add to `cspell.json` only for real, broadly used terms.
- **markers**: uppercase tag, single space, no colon, lowercase explanation. ✅ `// TODO add metric` ❌ `// TODO: add metric`
- **content placeholders**: unknown facts in content files use `TODO` markers so they are greppable. never invent a fact to fill a gap.

## extraction and abstraction

- **single-use = inline**: a value consumed once stays at the point of consumption. a function called once stays at the call site.
- **destructuring is extraction**: unpacking fields only to pass them on individually is a net negative.
- **two or more uses earn a name**: the threshold for extraction is a second call site.
- **prefer raw library apis**: use three.js and astro directly. no project-specific wrappers for a single use case.

## dependencies

- **runtime dependencies are a budget line**: every byte shipped to the browser must earn its place. adding a runtime dependency requires the owner's approval.
- **pin deliberately**: `three` stays on a single minor (`^0.186.x` locks it). `typescript` stays on `~6.0` until typescript-eslint and `@astrojs/check` support 7.
- **`minimumReleaseAge: 1440`** rejects packages published in the last day. that is deliberate. if an install fails on it, pin the previous patch instead of lowering the setting.

## development environment

- **toolchain**: node and pnpm versions live in `.tool-versions`. never use `npm`, `npx` or `yarn`; use `pnpm` and `pnpm exec`.
- **zero config**: `pnpm install` then `pnpm dev`. no `.env` files. no secrets in the repository — deploy credentials live only in github actions secrets.
- **the pre-commit hook**: `pnpm install` points `core.hooksPath` at `.githooks/`, so every commit runs type checks, eslint and prettier first. never reach for `--no-verify`.

### commands

- `pnpm dev`: start the dev server.
- `pnpm build`: build the static site into `dist/`.
- `pnpm test`: the authoritative gate. runs every `test:*` script and the build.
- `pnpm test:ts`, `pnpm test:eslint`, `pnpm test:prettier`, `pnpm test:spell`, `pnpm test:markdown`: individual checks.

## commits

this project uses [gitmoji](https://gitmoji.dev). conventional commits are **not** used.

- **format**: `<emoji> <scope>: <message>`, e.g. `✨ scene: add dither pass`.
- **emoji**: a single canonical gitmoji unicode character. never `:shortcodes:`.
- **scope**: mandatory, lowercase, from the table below.
- **message**: lowercase, imperative verb first, front-loaded keywords, no filler words, no trailing punctuation.

| scope        | meaning                                       |
| ------------ | --------------------------------------------- |
| site         | pages, layouts, components, styles            |
| scene        | the three.js hero and its shaders             |
| content      | copy, case studies, translations              |
| seo          | metadata, structured data, og images, sitemap |
| github       | github actions and ci                         |
| deploy       | hosting config, headers, redirects            |
| dependencies | dependency changes                            |
| agents       | agent instructions (`AGENTS.md`)              |
| global       | repository-wide changes that fit nothing else |

global tool config uses the tool name as scope (`eslint`, `prettier`, `astro`, `cspell`).

## file management

- **source images only**: optimized source images for case studies live in `src/assets/` and go through `astro:assets`. never commit generated output (`dist/`, `.astro/`, reports, screenshots).
- **no binary placeholders**: favicons, og images and fallbacks are generated from code (svg, satori) at build time.

## ai assistant directives

- **adopt, do not replace**: enforce the established conventions. never swap one (e.g. gitmoji) for another you prefer.
- **understand the intent**: interpret rules by their spirit, not their letter.
- **verify, don't recall**: astro 7 and three r186 changed apis you may remember differently. read the installed source in `node_modules/` or the official docs before using an api.
- **ask before**: adding runtime dependencies, changing the stack, publishing anything, or touching dns, hosting accounts or secrets.
