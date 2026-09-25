import region from "./region";
import translations from "./translations";

export default function period(value: { end?: string | undefined; start: string }, locale?: string) {
  if (value.start === "TODO" && !value.end) return value.start;
  const month = (date: string) =>
    date === "TODO"
      ? date
      : new Intl.DateTimeFormat(region(locale), { month: "short", timeZone: "UTC", year: "numeric" }).format(
          new Date(date),
        );
  return `${month(value.start)} – ${value.end ? month(value.end) : translations(locale)("Present")}`;
}
