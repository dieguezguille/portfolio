import type translations from "../i18n/translations";
import type contributions from "./contributions";

export default function when(contribution: (typeof contributions)[number], t: ReturnType<typeof translations>) {
  return contribution.kind === "contributor"
    ? t("since {{year}}").replace("{{year}}", () => String(contribution.year))
    : String(contribution.year);
}
