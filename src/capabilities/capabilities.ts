import type translations from "../i18n/translations";

export default function capabilities(t: ReturnType<typeof translations>) {
  return [
    {
      name: "Apps",
      items: [
        { name: "TypeScript", url: "https://www.typescriptlang.org" },
        { name: "React", url: "https://react.dev" },
        { name: "React Native", url: "https://reactnative.dev" },
        { name: "Expo", url: "https://expo.dev" },
        { name: "Next.js", url: "https://nextjs.org" },
      ],
    },
    {
      name: "Backend",
      items: [
        { name: "Hono", url: "https://hono.dev" },
        { name: "Postgres", url: "https://www.postgresql.org" },
        { name: "Drizzle", url: "https://orm.drizzle.team" },
        { name: "Supabase", url: "https://supabase.com" },
        { name: "Better Auth", url: "https://better-auth.com" },
      ],
    },
    {
      name: "Web3",
      items: [
        { name: "wagmi", url: "https://wagmi.sh" },
        { name: "viem", url: "https://viem.sh" },
        { name: "Alchemy Account Kit", url: "https://github.com/alchemyplatform/aa-sdk" },
        { name: "LI.FI", url: "https://li.fi" },
        { name: "ethers", url: "https://ethers.org" },
      ],
    },
    {
      name: t("Tooling"),
      items: [
        { name: "EAS", url: "https://docs.expo.dev/eas" },
        { name: "Maestro", url: "https://maestro.dev" },
        { name: "Claude Code", url: "https://claude.com/product/claude-code" },
        { name: "Sentry", url: "https://sentry.io" },
        { name: "Nx", url: "https://nx.dev" },
      ],
    },
  ];
}
