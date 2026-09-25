import type translations from "../i18n/translations";

export default function facts(t: ReturnType<typeof translations>): { id: string; items: Fact[]; name: string }[] {
  return [
    {
      id: "education",
      name: t("Education"),
      items: [
        { name: "Zero To Mastery Academy", detail: t("Computer programming"), period: "2018 – 2019" },
        { name: "Universidad Católica de Salta", detail: t("Associate's degree, psychology"), period: "2013 – 2017" },
      ],
    },
    {
      id: "languages",
      name: t("Languages"),
      items: [
        { name: t("Spanish"), detail: t("Native") },
        { name: t("English"), detail: t("Full professional (GESE grade 10)") },
        { name: t("Portuguese"), detail: t("Elementary") },
      ],
    },
    {
      id: "recognition",
      name: t("Recognition"),
      items: [
        { name: "Microsoft Student Partner", period: "2012 – 2013" },
        { name: "Microsoft Imagine Cup", detail: t("Finalist"), period: "2012" },
        { name: "Microsoft CodeCamp", detail: t("Finalist"), period: "2010" },
      ],
    },
  ];
}

type Fact = { detail?: string; name: string; period?: string };
