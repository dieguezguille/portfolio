// cspell:ignore appkit duongdev kristerkari lifinance reown
export default {
  name: "Guillermo Diéguez",
  handle: "dieguezguille",
  email: "dev@guillermodieguez.com",
  github: "https://github.com/dieguezguille",
  linkedin: "https://www.linkedin.com/in/dieguezguille",
  source: "https://github.com/dieguezguille/portfolio",
  country: "AR",
  timezone: "America/Argentina/Buenos_Aires",
  employer: { name: "Exa Labs", url: "https://exactly.app" },
  contributions: [
    {
      repo: "exactly/exa",
      title: "Exa App monorepo",
      url: "https://github.com/exactly/exa",
      kind: "contributor",
      year: 2024,
    },
    {
      repo: "kristerkari/react-native-svg-transformer",
      title: "fix: pass file path to svgr",
      url: "https://github.com/kristerkari/react-native-svg-transformer/pull/470",
      kind: "pull",
      year: 2026,
    },
    {
      repo: "reown-com/appkit-react-native",
      title: "[bug]: walletconnect modal styling bug on iOS",
      url: "https://github.com/reown-com/appkit-react-native/issues/496",
      kind: "issue",
      year: 2025,
    },
    {
      repo: "lifinance/sdk",
      title: "ValidationError - The from amount must be greater than zero when using toAmount",
      url: "https://github.com/lifinance/sdk/issues/226",
      kind: "issue",
      year: 2024,
    },
    {
      repo: "duongdev/phosphor-react-native",
      title: "Expo: phosphor-react-native v2.0.0 unable to resolve imports for web",
      url: "https://github.com/duongdev/phosphor-react-native/issues/58",
      kind: "issue",
      year: 2024,
    },
  ] as const,
};
