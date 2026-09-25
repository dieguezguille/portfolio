import build from "../footer/build";

import type translations from "../i18n/translations";

export default function summary(t: ReturnType<typeof translations>, start = "") {
  return t(
    "Software developer with {{years}} years of experience in fintech, web3, SaaS and games. Since 2024 I have been building the Exa App, a self-custodial wallet with a Visa card, in React Native, Expo and TypeScript, and since June 2026 I have led its frontend team.",
  ).replace("{{years}}", () => String(Math.floor((build.date.getTime() - Date.parse(start)) / 31_557_600_000)));
}
