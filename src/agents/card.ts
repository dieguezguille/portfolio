import translations from "../i18n/translations";
import profile from "../profile";
import studies from "../work/studies";

export default async function card(locale: string) {
  const t = translations(locale);
  const host = new URL(import.meta.env.SITE).host;
  const entries = await studies(locale);
  const graph = ["*", String.raw`|\ `, "| *", "* |", "|/ ", "*", "", ""];
  const text = [
    bold(profile.name),
    `${t("Head of frontend at")} ${profile.employer.name}`,
    "",
    ...wrap(
      t("My team and I build the Exa App, a self-custodial wallet with a Visa card, for iOS, Android and the web."),
      60,
    ),
    "",
    dim(`${t("Remote from Argentina")}, UTC−3`),
  ];
  const links = [
    [t("Work").toLowerCase(), entries.map((entry) => entry.data.title).join(" · ")],
    ["email", profile.email],
    ["github", profile.github.replace("https://", "")],
    ["linkedin", profile.linkedin.replace("https://www.", "")],
    ["cv", `${host}${locale === "es" ? "/es" : ""}/cv.pdf`],
  ];
  const other = locale === "es" ? ["# in English", host] : ["# en español", `${host}/es`];
  return [
    "",
    ...text.map((line, index) => `  ${accent((graph[index] ?? "").padEnd(4))} ${line}`),
    "",
    ...links.map(([label = "", value = ""]) => `  ${dim(label.padEnd(9))}${value}`),
    "",
    `  ${dim(other[0] ?? "")}`,
    `  ${accent("$")} curl ${other[1] ?? ""}`,
    `  ${dim(`# ${t("The whole site as markdown")}`)}`,
    `  ${accent("$")} curl -H "Accept: text/markdown" ${host}`,
    "",
    "",
  ].join("\n");
}

const escape = (code: string) => (text: string) => `\u{1B}[${code}m${text}\u{1B}[0m`;
const accent = escape("38;2;255;90;31");
const bold = escape("1");
const dim = escape("2");

function wrap(text: string, width: number) {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(" ")) {
    if (line && `${line} ${word}`.length > width) {
      lines.push(line);
      line = word;
    } else {
      line = line ? `${line} ${word}` : word;
    }
  }
  return [...lines, line];
}
