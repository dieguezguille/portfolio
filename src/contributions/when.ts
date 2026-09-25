import type translations from "../i18n/translations";
import type profile from "../profile";

export default function when(contribution: (typeof profile.contributions)[number], t: ReturnType<typeof translations>) {
  return contribution.kind === "contributor"
    ? t("since {{year}}").replace("{{year}}", () => String(contribution.year))
    : String(contribution.year);
}
